from __future__ import annotations

import json
import os
from collections import deque
from typing import Any
from uuid import uuid4

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://invalid:invalid@127.0.0.1:1/unconfigured",
)

import pytest
from fastapi.testclient import TestClient

from app import main as main_module
from app.db import UsageStats
from app.main import app
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
from app.task_executor import TaskExecutor
from app.tracing import ExecutionAttempt, StoredAttempt, StoredTaskTrace


class InMemoryStore:
    """Mock store implementing the virtual key and task tracing contract in memory."""

    def __init__(self) -> None:
        self.virtual_keys = {
            "vk_open": {"budget": 50, "requests": 0, "tokens_in": 0, "tokens_out": 0},
            "vk_tiny": {"budget": 2, "requests": 0, "tokens_in": 0, "tokens_out": 0},
            "vk_edge": {"budget": 1, "requests": 0, "tokens_in": 0, "tokens_out": 0},
        }
        self.task_executions: dict[str, dict[str, Any]] = {}
        self.task_attempts: dict[str, list[ExecutionAttempt]] = {}
        self.usage_events: list[dict[str, Any]] = []

    def get_usage(self, key: str) -> UsageStats | None:
        vk = self.virtual_keys.get(key)
        if vk is None:
            return None
        return UsageStats(
            key=key,
            requests=vk["requests"],
            tokens_in=vk["tokens_in"],
            tokens_out=vk["tokens_out"],
            budget=vk["budget"],
        )

    def reserve_request(self, key: str) -> str:
        vk = self.virtual_keys.get(key)
        if vk is None:
            return "unknown"
        if vk["requests"] >= vk["budget"]:
            return "over_budget"
        vk["requests"] += 1
        return "reserved"

    def release_request(self, key: str) -> None:
        vk = self.virtual_keys.get(key)
        if vk is not None:
            vk["requests"] = max(vk["requests"] - 1, 0)

    def record_success(
        self,
        key: str,
        provider: str,
        tokens_in: int,
        tokens_out: int,
    ) -> None:
        self.record_usage_events(key, [(provider, tokens_in, tokens_out)])

    def create_task_execution(self, task_id: str, virtual_key_id: str, skill: str) -> None:
        self.task_executions[task_id] = {
            "task_id": task_id,
            "virtual_key_id": virtual_key_id,
            "skill": skill,
            "status": "running",
            "final_provider": None,
            "attempts": 0,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "error_category": None,
        }
        self.task_attempts[task_id] = []

    def append_task_attempt(self, task_id: str, attempt: ExecutionAttempt) -> None:
        if task_id in self.task_attempts:
            self.task_attempts[task_id].append(attempt)

    def create_task_tool_execution(self, task_id: str, tool_number: int, tool_name: str) -> None:
        pass

    def finalize_task_tool_execution(
        self,
        task_id: str,
        tool_number: int,
        status: str,
        error_category: str | None,
        duration_ms: int,
    ) -> None:
        pass

    def record_usage_events(
        self,
        key: str,
        events: list[tuple[str, int, int]],
        *,
        task_id: str | None = None,
        trace_status: str | None = None,
        final_provider: str | None = None,
        attempts: int | None = None,
        error_category: str | None = None,
    ) -> None:
        vk = self.virtual_keys.get(key)
        if vk:
            for _, tokens_in, tokens_out in events:
                vk["tokens_in"] += tokens_in
                vk["tokens_out"] += tokens_out
                self.usage_events.append({"key": key, "tokens_in": tokens_in, "tokens_out": tokens_out})

        if task_id and task_id in self.task_executions:
            t = self.task_executions[task_id]
            t["status"] = trace_status
            t["final_provider"] = final_provider
            t["attempts"] = attempts
            t["error_category"] = error_category
            t["prompt_tokens"] = sum(p for _, p, _ in events)
            t["completion_tokens"] = sum(c for _, _, c in events)

    def finalize_failed_task_without_usage(
        self,
        key: str,
        task_id: str,
        attempts: int,
        error_category: str,
    ) -> None:
        self.release_request(key)
        if task_id in self.task_executions:
            t = self.task_executions[task_id]
            t["status"] = "failed"
            t["attempts"] = attempts
            t["error_category"] = error_category

    def get_task_execution(self, task_id: str, virtual_key_id: str) -> StoredTaskTrace | None:
        t = self.task_executions.get(task_id)
        if t is None or t["virtual_key_id"] != virtual_key_id:
            return None
        attempts = tuple(
            StoredAttempt(
                attempt_number=a.attempt_number,
                provider=a.provider,
                attempt_type=a.attempt_type,
                status=a.status,
                prompt_tokens=a.prompt_tokens,
                completion_tokens=a.completion_tokens,
                validation_error_category=a.validation_error_category,
                provider_error_category=a.provider_error_category,
                created_at="2026-10-01T00:00:00Z",
            )
            for a in self.task_attempts.get(task_id, [])
        )
        return StoredTaskTrace(
            task_id=t["task_id"],
            status=t["status"],
            skill=t["skill"],
            final_provider=t["final_provider"],
            attempts=t["attempts"],
            prompt_tokens=t["prompt_tokens"],
            completion_tokens=t["completion_tokens"],
            error_category=t["error_category"],
            created_at="2026-10-01T00:00:00Z",
            completed_at="2026-10-01T00:00:01Z",
            attempt_history=attempts,
            tool_history=(),
        )

    def get_preference_values(self, virtual_key_id: str) -> dict[str, str]:
        return {}

    def upsert_preference_values(self, virtual_key_id: str, values: dict[str, str]) -> None:
        pass

    def delete_preference_value(self, virtual_key_id: str, preference_key: str) -> bool:
        return True


class MockProviderGateway:
    def __init__(self) -> None:
        self.events: dict[str, deque[Any]] = {"groq": deque(), "gemini": deque()}
        self.calls: list[tuple[str, list[dict[str, str]]]] = []

    def queue(self, provider_name: str, *events: Any) -> None:
        self.events[provider_name].extend(events)

    def complete_with_provider(self, provider_name: str, messages: list[dict[str, str]]) -> ProviderCompletion:
        self.calls.append((provider_name, messages))
        if not self.events[provider_name]:
            raise AssertionError(f"unexpected call to {provider_name}")
        event = self.events[provider_name].popleft()
        if isinstance(event, Exception):
            raise event
        return event

    def complete(self, messages: list[dict[str, str]]) -> ProviderCompletion:
        return self.complete_with_provider("groq", messages)


@pytest.fixture
def mock_app_environment(monkeypatch: pytest.MonkeyPatch):
    mem_store = InMemoryStore()
    mock_providers = MockProviderGateway()
    executor = TaskExecutor(
        SkillLoader(),
        PromptBuilder(),
        mock_providers,  # type: ignore[arg-type]
        OutputValidator(),
    )
    monkeypatch.setattr(main_module, "store", mem_store)
    monkeypatch.setattr(main_module, "providers", mock_providers)
    monkeypatch.setattr(main_module, "task_executor", executor)
    return mem_store, mock_providers


def test_openapi_has_http_bearer_security_scheme() -> None:
    schema = app.openapi()
    components = schema.get("components", {})
    security_schemes = components.get("securitySchemes", {})

    assert "HTTPBearer" in security_schemes
    assert security_schemes["HTTPBearer"] == {
        "type": "http",
        "scheme": "bearer",
    }


def test_protected_endpoints_require_http_bearer_in_openapi() -> None:
    schema = app.openapi()
    paths = schema.get("paths", {})

    protected_routes = [
        ("post", "/v1/chat/completions"),
        ("post", "/v1/tasks/execute"),
        ("post", "/v1/workflows/execute"),
        ("get", "/v1/workflows/{workflow_id}"),
        ("get", "/v1/tasks/{task_id}"),
        ("get", "/v1/preferences"),
        ("put", "/v1/preferences"),
        ("delete", "/v1/preferences/{preference_key}"),
    ]

    for method, path in protected_routes:
        operation = paths[path][method]
        assert operation.get("security") == [{"HTTPBearer": []}], f"Missing security on {method.upper()} {path}"
        param_names = [p["name"] for p in operation.get("parameters", [])]
        assert "authorization" not in param_names, f"'authorization' header param unexpectedly present on {method.upper()} {path}"


def test_unprotected_endpoints_do_not_require_security() -> None:
    schema = app.openapi()
    paths = schema.get("paths", {})

    unprotected_routes = [
        ("get", "/usage"),
        ("get", "/healthz"),
    ]

    for method, path in unprotected_routes:
        operation = paths[path][method]
        assert operation.get("security") is None, f"Unexpected security on {method.upper()} {path}"


@pytest.mark.parametrize(
    "auth_header",
    [None, "vk_open", "Basic vk_open", "Bearer", "Bearer   "],
)
def test_authentication_rejects_missing_or_malformed_bearer(
    mock_app_environment: Any,
    auth_header: str | None,
) -> None:
    client = TestClient(app)
    headers = {"Authorization": auth_header} if auth_header is not None else {}
    response = client.post(
        "/v1/tasks/execute",
        headers=headers,
        json={"skill": "summarize", "input": {"text": "hello"}},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "missing or unknown virtual key"}


def test_authentication_rejects_unknown_virtual_key(mock_app_environment: Any) -> None:
    client = TestClient(app)
    response = client.post(
        "/v1/tasks/execute",
        headers={"Authorization": "Bearer vk_nonexistent"},
        json={"skill": "summarize", "input": {"text": "hello"}},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "missing or unknown virtual key"}


def test_vk_open_successful_groq_flow_end_to_end(mock_app_environment: Any) -> None:
    mem_store, mock_providers = mock_app_environment
    summary_json = json.dumps({"summary": "Meeting notes", "key_points": ["Point 1"]})
    mock_providers.queue("groq", ProviderCompletion(content=summary_json, prompt_tokens=10, completion_tokens=5, provider="groq"))

    client = TestClient(app)
    response = client.post(
        "/v1/tasks/execute",
        headers={"Authorization": "Bearer vk_open"},
        json={"skill": "summarize", "input": {"text": "Meeting notes to summarize."}},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["provider"] == "groq"
    assert body["attempts"] == 1
    assert body["output"] == {"summary": "Meeting notes", "key_points": ["Point 1"]}
    assert body["usage"] == {"prompt_tokens": 10, "completion_tokens": 5}

    # Verify only Groq was called, no Gemini fallback
    assert len(mock_providers.calls) == 1
    assert mock_providers.calls[0][0] == "groq"

    # Verify budget consumed exactly 1
    stats = mem_store.get_usage("vk_open")
    assert stats is not None
    assert stats.requests == 1
    assert stats.tokens_in == 10
    assert stats.tokens_out == 5

    # Verify trace was stored with owner matching vk_open
    task_id = body["task_id"]
    trace_resp = client.get(f"/v1/tasks/{task_id}", headers={"Authorization": "Bearer vk_open"})
    assert trace_resp.status_code == 200
    trace_data = trace_resp.json()
    assert trace_data["status"] == "completed"
    assert trace_data["provider"] == "groq"
    assert trace_data["attempts"] == 1
    assert len(trace_data["attempt_history"]) == 1
    assert trace_data["attempt_history"][0]["provider"] == "groq"
    assert trace_data["attempt_history"][0]["attempt_type"] == "initial"
    assert trace_data["attempt_history"][0]["status"] == "completed"


def test_vk_open_groq_operational_error_falls_back_to_gemini(mock_app_environment: Any) -> None:
    mem_store, mock_providers = mock_app_environment
    summary_json = json.dumps({"summary": "The team approved the release.", "key_points": ["Release is scheduled for Friday."]})
    mock_providers.queue("groq", ProviderOperationalError("groq rate limit / 500"))
    mock_providers.queue("gemini", ProviderCompletion(content=summary_json, prompt_tokens=12, completion_tokens=6, provider="gemini"))

    client = TestClient(app)
    response = client.post(
        "/v1/tasks/execute",
        headers={"Authorization": "Bearer vk_open"},
        json={"skill": "summarize", "input": {"text": "The team approved the release for Friday."}},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["provider"] == "gemini"
    assert body["attempts"] == 2

    # Verify 1 budget consumed
    stats = mem_store.get_usage("vk_open")
    assert stats is not None
    assert stats.requests == 1


def test_vk_open_all_providers_fail_releases_reservation(mock_app_environment: Any) -> None:
    mem_store, mock_providers = mock_app_environment
    mock_providers.queue("groq", ProviderOperationalError("groq 500"))
    mock_providers.queue("gemini", ProviderOperationalError("gemini 500"))

    client = TestClient(app)
    response = client.post(
        "/v1/tasks/execute",
        headers={"Authorization": "Bearer vk_open"},
        json={"skill": "summarize", "input": {"text": "Some text"}},
    )

    assert response.status_code == 502
    assert response.json() == {"detail": "all providers unavailable"}

    # Reservation must be released
    stats = mem_store.get_usage("vk_open")
    assert stats is not None
    assert stats.requests == 0


def test_vk_open_primary_repair_consumes_one_request(mock_app_environment: Any) -> None:
    mem_store, mock_providers = mock_app_environment
    summary_json = json.dumps({"summary": "The team approved the release.", "key_points": ["Release is scheduled for Friday."]})
    mock_providers.queue("groq", ProviderCompletion(content="not json", prompt_tokens=4, completion_tokens=2, provider="groq"))
    mock_providers.queue("groq", ProviderCompletion(content=summary_json, prompt_tokens=8, completion_tokens=4, provider="groq"))

    client = TestClient(app)
    response = client.post(
        "/v1/tasks/execute",
        headers={"Authorization": "Bearer vk_open"},
        json={"skill": "summarize", "input": {"text": "The team approved the release for Friday."}},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["provider"] == "groq"
    assert body["attempts"] == 2
    assert body["usage"] == {"prompt_tokens": 12, "completion_tokens": 6}

    # Verify 1 budget unit consumed
    stats = mem_store.get_usage("vk_open")
    assert stats is not None
    assert stats.requests == 1
    assert stats.tokens_in == 12
    assert stats.tokens_out == 6


def test_vk_edge_budget_exhaustion_returns_429(mock_app_environment: Any) -> None:
    mem_store, mock_providers = mock_app_environment
    summary_json = json.dumps({"summary": "The team approved the release.", "key_points": ["Release is scheduled for Friday."]})
    mock_providers.queue("groq", ProviderCompletion(content=summary_json, prompt_tokens=5, completion_tokens=3, provider="groq"))

    client = TestClient(app)
    first_resp = client.post(
        "/v1/tasks/execute",
        headers={"Authorization": "Bearer vk_edge"},
        json={"skill": "summarize", "input": {"text": "The team approved the release for Friday."}},
    )
    assert first_resp.status_code == 200

    second_resp = client.post(
        "/v1/tasks/execute",
        headers={"Authorization": "Bearer vk_edge"},
        json={"skill": "summarize", "input": {"text": "The team approved the release for Friday."}},
    )
    assert second_resp.status_code == 429
    assert second_resp.json() == {"detail": "virtual key budget exhausted"}


def test_chat_completions_with_vk_open(mock_app_environment: Any) -> None:
    mem_store, mock_providers = mock_app_environment
    mock_providers.queue("groq", ProviderCompletion(content="Hello world", prompt_tokens=5, completion_tokens=2, provider="groq"))

    client = TestClient(app)
    response = client.post(
        "/v1/chat/completions",
        headers={"Authorization": "Bearer vk_open"},
        json={"model": "gpt-oss", "messages": [{"role": "user", "content": "Hi"}]},
    )

    assert response.status_code == 200
    assert response.json()["content"] == "Hello world"
    assert response.json()["usage"] == {"prompt_tokens": 5, "completion_tokens": 2}


def test_preferences_endpoints_with_vk_open(mock_app_environment: Any) -> None:
    client = TestClient(app)
    get_resp = client.get("/v1/preferences", headers={"Authorization": "Bearer vk_open"})
    assert get_resp.status_code == 200
    assert get_resp.json() == {"preferences": {}}

    put_resp = client.put(
        "/v1/preferences",
        headers={"Authorization": "Bearer vk_open"},
        json={"preferences": {"preferred_language": "English"}},
    )
    assert put_resp.status_code == 200

    del_resp = client.delete(
        "/v1/preferences/preferred_language",
        headers={"Authorization": "Bearer vk_open"},
    )
    assert del_resp.status_code == 204
