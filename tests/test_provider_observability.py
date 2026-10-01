from __future__ import annotations

import logging
from typing import Any

import httpx
import pytest

from app.config import Settings, get_settings
from app.output_validation import OutputValidator
from app.prompt_builder import PromptBuilder
from app.providers import (
    ProviderCompletion,
    ProviderConfigurationError,
    ProviderError,
    ProviderGateway,
    ProviderOperationalError,
)
from app.skills import SkillLoader
from app.task_executor import PreparedTask, TaskExecutor


def _settings(**kwargs: Any) -> Settings:
    defaults: dict[str, Any] = {
        "database_url": "postgresql+psycopg://unused:unused@127.0.0.1:1/unused",
        "groq_api_key": "fake-groq-key",
        "groq_model": "gateway-owned-groq-model",
        "gemini_api_key": "fake-gemini-key",
        "gemini_model": "gateway-owned-gemini-model",
        "provider_timeout_seconds": 1.0,
        "force_primary_fail": False,
    }
    defaults.update(kwargs)
    return Settings(**defaults)


def test_settings_strips_whitespace_and_treats_empty_as_unset(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    get_settings.cache_clear()
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://u:p@localhost/db")
    monkeypatch.setenv("GROQ_API_KEY", "  \r\n gsk_12345678 \t\n")
    monkeypatch.setenv("GEMINI_API_KEY", "\r\n  AIzaSyTestKey \n")
    monkeypatch.setenv("GROQ_MODEL", "  llama-3.3-70b-versatile \r\n")
    monkeypatch.setenv("GEMINI_MODEL", "\t gemini-1.5-pro \n")

    settings = get_settings()
    assert settings.groq_api_key == "gsk_12345678"
    assert settings.gemini_api_key == "AIzaSyTestKey"
    assert settings.groq_model == "llama-3.3-70b-versatile"
    assert settings.gemini_model == "gemini-1.5-pro"

    get_settings.cache_clear()
    monkeypatch.setenv("GROQ_API_KEY", "   \r\n \t ")
    monkeypatch.setenv("GEMINI_API_KEY", "   \n ")
    monkeypatch.setenv("GROQ_MODEL", "   \r\n ")
    monkeypatch.setenv("GEMINI_MODEL", "  \t ")

    empty_settings = get_settings()
    assert empty_settings.groq_api_key == ""
    assert empty_settings.gemini_api_key == ""
    assert empty_settings.groq_model == "openai/gpt-oss-20b"
    assert empty_settings.gemini_model == "gemini-3.1-flash-lite"
    get_settings.cache_clear()


class DummyResponse:
    def __init__(self, status_code: int) -> None:
        self.status_code = status_code


@pytest.mark.parametrize(
    ("status_code", "expected_exception", "expected_message"),
    [
        (400, ProviderConfigurationError, "provider request configuration was rejected status=400"),
        (401, ProviderConfigurationError, "provider request configuration was rejected status=401"),
        (403, ProviderConfigurationError, "provider request configuration was rejected status=403"),
        (404, ProviderConfigurationError, "provider request configuration was rejected status=404"),
        (422, ProviderConfigurationError, "provider request configuration was rejected status=422"),
        (408, ProviderOperationalError, "provider request failed operationally status=408"),
        (429, ProviderOperationalError, "provider request failed operationally status=429"),
        (500, ProviderOperationalError, "provider request failed operationally status=500"),
        (502, ProviderOperationalError, "provider request failed operationally status=502"),
        (503, ProviderOperationalError, "provider request failed operationally status=503"),
        (504, ProviderOperationalError, "provider request failed operationally status=504"),
    ],
)
def test_raise_for_failed_status_includes_status_code(
    status_code: int,
    expected_exception: type[ProviderError],
    expected_message: str,
) -> None:
    with pytest.raises(expected_exception) as exc_info:
        ProviderGateway._raise_for_failed_status(DummyResponse(status_code))  # type: ignore[arg-type]
    assert str(exc_info.value) == expected_message


def test_complete_logs_warning_on_primary_failure(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    gateway = ProviderGateway(_settings())

    def failing_primary(messages: list[dict[str, str]]) -> ProviderCompletion:
        raise ProviderOperationalError("provider request failed operationally status=429")

    def successful_fallback(messages: list[dict[str, str]]) -> ProviderCompletion:
        return ProviderCompletion(
            content="fallback content",
            prompt_tokens=10,
            completion_tokens=5,
            provider="gemini",
        )

    monkeypatch.setattr(gateway, "_complete_with_groq", failing_primary)
    monkeypatch.setattr(gateway, "_complete_with_gemini", successful_fallback)

    with caplog.at_level(logging.WARNING):
        result = gateway.complete([{"role": "user", "content": "hi"}])

    assert result.content == "fallback content"
    assert any(
        "primary provider failed: ProviderOperationalError: provider request failed operationally status=429" in record.message
        for record in caplog.records
    )


def test_task_executor_logs_warning_on_primary_failure(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    gateway = ProviderGateway(_settings())

    def failing_primary(messages: list[dict[str, str]]) -> ProviderCompletion:
        raise ProviderOperationalError("provider request failed operationally status=503")

    def successful_fallback(messages: list[dict[str, str]]) -> ProviderCompletion:
        return ProviderCompletion(
            content='{"action_items": []}',
            prompt_tokens=10,
            completion_tokens=5,
            provider="gemini",
        )

    monkeypatch.setattr(gateway, "_complete_with_groq", failing_primary)
    monkeypatch.setattr(gateway, "_complete_with_gemini", successful_fallback)

    skill_loader = SkillLoader()
    executor = TaskExecutor(
        skill_loader,
        PromptBuilder(),
        gateway,
        OutputValidator(),
    )
    prepared = executor.prepare(
        "extract_action_items",
        {"text": "Schedule follow up meeting by Friday."},
    )

    with caplog.at_level(logging.WARNING):
        result = executor.execute(prepared)

    assert result.provider == "gemini"
    assert any(
        "primary provider failed: ProviderOperationalError: provider request failed operationally status=503" in record.message
        for record in caplog.records
    )


def test_groq_generic_httperror_includes_exception_type(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    gateway = ProviderGateway(_settings())

    def fake_post(*args: Any, **kwargs: Any) -> Any:
        raise httpx.ConnectTimeout("connection timed out")

    monkeypatch.setattr("app.providers.httpx.post", fake_post)

    with pytest.raises(ProviderOperationalError) as exc_info:
        gateway._complete_with_groq([{"role": "user", "content": "hello"}])

    assert str(exc_info.value) == "primary provider response was unusable: ConnectTimeout"


def test_gemini_generic_httperror_includes_exception_type(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    gateway = ProviderGateway(_settings())

    def fake_post(*args: Any, **kwargs: Any) -> Any:
        raise httpx.ReadTimeout("read timed out")

    monkeypatch.setattr("app.providers.httpx.post", fake_post)

    with pytest.raises(ProviderOperationalError) as exc_info:
        gateway._complete_with_gemini([{"role": "user", "content": "hello"}])

    assert str(exc_info.value) == "fallback provider response was unusable: ReadTimeout"


def test_groq_payload_includes_reasoning_format_hidden(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    gateway = ProviderGateway(_settings())
    captured: dict[str, Any] = {}

    class FakeResponse:
        is_success = True

        def json(self) -> dict[str, Any]:
            return {
                "choices": [{"message": {"content": "response"}, "finish_reason": "stop"}],
                "usage": {"prompt_tokens": 5, "completion_tokens": 2},
            }

    def fake_post(url: str, **kwargs: Any) -> Any:
        captured["url"] = url
        captured.update(kwargs)
        return FakeResponse()

    monkeypatch.setattr("app.providers.httpx.post", fake_post)
    completion = gateway._complete_with_groq([{"role": "user", "content": "hello"}])

    assert completion.content == "response"
    assert captured["json"]["reasoning_format"] == "hidden"
    assert captured["json"]["reasoning_effort"] == "low"
    assert captured["json"]["max_completion_tokens"] == 512

