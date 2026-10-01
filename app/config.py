from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache


def _enabled(name: str, default: str = "0") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


def _clean_str(name: str, default: str = "") -> str:
    raw = os.getenv(name)
    if raw is None:
        return default.strip()
    cleaned = raw.strip()
    return cleaned if cleaned else default.strip()


@dataclass(frozen=True)
class Settings:
    database_url: str
    groq_api_key: str
    groq_model: str
    gemini_api_key: str
    gemini_model: str
    provider_timeout_seconds: float
    force_primary_fail: bool


@lru_cache
def get_settings() -> Settings:
    timeout = float(os.getenv("PROVIDER_TIMEOUT_SECONDS", "30"))
    if timeout <= 0:
        raise ValueError("PROVIDER_TIMEOUT_SECONDS must be positive")
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise ValueError("DATABASE_URL is required")

    return Settings(
        database_url=database_url,
        groq_api_key=_clean_str("GROQ_API_KEY", ""),
        groq_model=_clean_str("GROQ_MODEL", "openai/gpt-oss-20b"),
        gemini_api_key=_clean_str("GEMINI_API_KEY", ""),
        gemini_model=_clean_str("GEMINI_MODEL", "gemini-3.1-flash-lite"),
        provider_timeout_seconds=timeout,
        force_primary_fail=_enabled("FORCE_PRIMARY_FAIL"),
    )
