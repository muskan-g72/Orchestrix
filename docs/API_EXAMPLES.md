# Orchestrix API Examples

This document contains verified request and response examples for the Orchestrix gateway endpoints, reflecting exact contract schemas, status codes, and error strings defined in `app/main.py`.

---

## 1. Execute Task (`POST /v1/tasks/execute`)

Executes a registered YAML skill (`summarize`, `extract_action_items`) with Pydantic output schema validation, provider execution, and persistent tracing.

### Request

```http
POST /v1/tasks/execute HTTP/1.1
Host: orchestrix-yc6s.onrender.com
Authorization: Bearer vk_open
Content-Type: application/json

{
  "skill": "summarize",
  "input": {
    "text": "Orchestrix is a deterministic AI execution gateway built on FastAPI. It enforces virtual-key authentication, atomic PostgreSQL request budget reservations, Groq primary execution with automatic Gemini fallback, structured output validation with single-cycle bounded repair, and persistent execution traces."
  }
}
```

### Response (`200 OK`)

```json
{
  "task_id": "7d91e3bf-1c4e-4b2a-89a1-52f01f8d9b1c",
  "status": "completed",
  "skill": "summarize",
  "output": {
    "summary": "Orchestrix is a deterministic FastAPI-based AI execution gateway providing virtual-key authentication, atomic PostgreSQL budget reservations, Groq and Gemini dual-provider routing, bounded repair for schema validation, and persistent traces.",
    "key_points": [
      "Provides deterministic AI execution without uncontrolled autonomous loops.",
      "Uses PostgreSQL atomic locks to serialize budget consumption and prevent overspending.",
      "Routes to Groq primary with automated fallback to Gemini.",
      "Validates structured responses against schemas with at most one bounded repair attempt."
    ]
  },
  "provider": "groq",
  "attempts": 1,
  "usage": {
    "prompt_tokens": 185,
    "completion_tokens": 74
  }
}
```

---

## 2. Retrieve Virtual Key Usage (`GET /usage`)

Returns the current request budget, consumed request units, token totals, and remaining quota for a virtual key.

### Request

```http
GET /usage?key=vk_open HTTP/1.1
Host: orchestrix-yc6s.onrender.com
```

### Response (`200 OK`)

```json
{
  "key": "vk_open",
  "requests": 14,
  "tokens_in": 6420,
  "tokens_out": 2840,
  "spend": 14,
  "budget": 50,
  "remaining": 36
}
```

---

## 3. Budget Exhausted Error (`429 Too Many Requests`)

Returned when a virtual key (e.g. `vk_edge` with a 1-request budget or `vk_tiny` with a 2-request budget) has consumed its allocated requests. PostgreSQL serializes budget updates to guarantee zero overspend.

### Request

```http
POST /v1/tasks/execute HTTP/1.1
Host: orchestrix-yc6s.onrender.com
Authorization: Bearer vk_edge
Content-Type: application/json

{
  "skill": "summarize",
  "input": {
    "text": "Sample input text for an exhausted key."
  }
}
```

### Response (`429 Too Many Requests`)

```json
{
  "detail": "virtual key budget exhausted"
}
```

---

## 4. Authentication Error (`401 Unauthorized`)

Returned when the `Authorization` header is missing, malformed, or references an unregistered virtual key.

### Request (Missing Authorization Header)

```http
POST /v1/tasks/execute HTTP/1.1
Host: orchestrix-yc6s.onrender.com
Content-Type: application/json

{
  "skill": "summarize",
  "input": {
    "text": "Sample input text."
  }
}
```

### Request (Unknown Virtual Key)

```http
POST /v1/tasks/execute HTTP/1.1
Host: orchestrix-yc6s.onrender.com
Authorization: Bearer vk_unknown
Content-Type: application/json

{
  "skill": "summarize",
  "input": {
    "text": "Sample input text."
  }
}
```

### Response (`401 Unauthorized`)

```json
{
  "detail": "missing or unknown virtual key"
}
```
