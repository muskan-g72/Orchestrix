import {
  ChatResponse,
  HealthResponse,
  PreferencesResponse,
  TaskResponse,
  TaskTraceResponse,
  UsageResponse,
  WorkflowResponse,
  WorkflowTraceResponse,
} from "./types";

export const MOCK_USAGE: UsageResponse = {
  key: "vk_open",
  requests: 14,
  tokens_in: 6420,
  tokens_out: 2840,
  spend: 14,
  budget: 50,
  remaining: 36,
};

export const MOCK_HEALTH: HealthResponse = {
  status: "ok",
};

export const MOCK_PREFERENCES: PreferencesResponse = {
  preferences: {
    language: "en",
    summary_depth: "concise",
    enforce_bullet_points: true,
    max_action_items: 5,
  },
};

export const MOCK_CHAT_RESPONSE: ChatResponse = {
  content:
    "Orchestrix gateway completed request via Groq. Virtual-key admission: atomic reservation successful, budget updated.",
  usage: {
    prompt_tokens: 142,
    completion_tokens: 38,
  },
};

export const MOCK_TASK_EXECUTION: TaskResponse = {
  task_id: "7d91e3bf-1c4e-4b2a-89a1-52f01f8d9b1c",
  status: "completed",
  skill: "summarize",
  output: {
    summary:
      "Orchestrix acts as a deterministic FastAPI execution gateway providing virtual-key authentication, atomic budget reservation, Groq primary execution with automatic Gemini fallback, and persistent trace recording.",
    key_points: [
      "No autonomous planning or uncontrolled loops; predictable execution flow.",
      "PostgreSQL serializes concurrent budget checks to guarantee zero overspending.",
      "Strict schema enforcement with at most one bounded repair attempt.",
      "Auditable execution traces persist operational metrics without recording user secrets.",
    ],
    reading_time_minutes: 1.2,
  },
  provider: "groq",
  attempts: 2,
  usage: {
    prompt_tokens: 720,
    completion_tokens: 184,
  },
};

export const MOCK_TASK_TRACE: TaskTraceResponse = {
  task_id: "7d91e3bf-1c4e-4b2a-89a1-52f01f8d9b1c",
  status: "completed",
  skill: "summarize",
  provider: "groq",
  attempts: 2,
  usage: {
    prompt_tokens: 720,
    completion_tokens: 184,
  },
  error_category: null,
  created_at: "2026-09-28T10:14:02.124Z",
  completed_at: "2026-09-28T10:14:03.612Z",
  attempt_history: [
    {
      attempt_number: 1,
      provider: "groq",
      attempt_type: "initial",
      status: "validation_error",
      usage: {
        prompt_tokens: 340,
        completion_tokens: 64,
      },
      validation_error_category: "structure",
      provider_error_category: null,
      created_at: "2026-09-28T10:14:02.130Z",
    },
    {
      attempt_number: 2,
      provider: "groq",
      attempt_type: "repair",
      status: "completed",
      usage: {
        prompt_tokens: 380,
        completion_tokens: 120,
      },
      validation_error_category: null,
      provider_error_category: null,
      created_at: "2026-09-28T10:14:02.940Z",
    },
  ],
  tool_history: [
    {
      tool_number: 1,
      tool_name: "text_statistics",
      status: "completed",
      error_category: null,
      duration_ms: 18,
      created_at: "2026-09-28T10:14:03.200Z",
      completed_at: "2026-09-28T10:14:03.218Z",
    },
  ],
};

export const MOCK_WORKFLOW_EXECUTION: WorkflowResponse = {
  workflow_id: "f3a0984c-789a-4c22-b5e1-0cde19842a3f",
  status: "completed",
  workflow: "article_processing",
  steps: [
    {
      step_order: 1,
      step_id: "step_summarize",
      name: "Summarize Source Text",
      skill: "summarize",
      status: "completed",
      provider: "groq",
      attempts: 1,
      tool_count: 0,
      usage: {
        prompt_tokens: 410,
        completion_tokens: 95,
      },
    },
    {
      step_order: 2,
      step_id: "step_extract_action_items",
      name: "Extract Action Items",
      skill: "extract_action_items",
      status: "completed",
      provider: "groq",
      attempts: 1,
      tool_count: 0,
      usage: {
        prompt_tokens: 520,
        completion_tokens: 140,
      },
    },
    {
      step_order: 3,
      step_id: "step_final_synthesis",
      name: "Final Synthesis & Statistics",
      skill: "summarize",
      status: "completed",
      provider: "gemini",
      attempts: 2,
      tool_count: 1,
      usage: {
        prompt_tokens: 680,
        completion_tokens: 160,
      },
    },
  ],
  output: {
    overview:
      "Deterministic 3-step article analysis completed without dynamic planning or unbounded branching.",
    key_findings: [
      "Step 1 verified source structure.",
      "Step 2 isolated verifiable action items.",
      "Step 3 invoked allowlisted text_statistics and finalized validated output.",
    ],
    statistics: {
      word_count: 420,
      sentence_count: 22,
      character_count: 2840,
    },
  },
  usage: {
    prompt_tokens: 1610,
    completion_tokens: 395,
  },
};

export const MOCK_WORKFLOW_TRACE: WorkflowTraceResponse = {
  workflow_id: "f3a0984c-789a-4c22-b5e1-0cde19842a3f",
  workflow: "article_processing",
  name: "Article Processing Sequential Workflow",
  description:
    "Predeclared 3-step task pipeline: summarize, extract action items, and compute text statistics.",
  status: "completed",
  step_count: 3,
  completed_steps: 3,
  attempts: 4,
  tool_count: 1,
  usage: {
    prompt_tokens: 1610,
    completion_tokens: 395,
  },
  error_category: null,
  created_at: "2026-09-28T10:15:00.000Z",
  completed_at: "2026-09-28T10:15:04.250Z",
  steps: [
    {
      step_order: 1,
      step_id: "step_summarize",
      name: "Summarize Source Text",
      skill: "summarize",
      status: "completed",
      provider: "groq",
      attempts: 1,
      tool_count: 0,
      usage: {
        prompt_tokens: 410,
        completion_tokens: 95,
      },
      error_category: null,
      created_at: "2026-09-28T10:15:00.050Z",
      started_at: "2026-09-28T10:15:00.060Z",
      completed_at: "2026-09-28T10:15:01.200Z",
    },
    {
      step_order: 2,
      step_id: "step_extract_action_items",
      name: "Extract Action Items",
      skill: "extract_action_items",
      status: "completed",
      provider: "groq",
      attempts: 1,
      tool_count: 0,
      usage: {
        prompt_tokens: 520,
        completion_tokens: 140,
      },
      error_category: null,
      created_at: "2026-09-28T10:15:01.210Z",
      started_at: "2026-09-28T10:15:01.220Z",
      completed_at: "2026-09-28T10:15:02.500Z",
    },
    {
      step_order: 3,
      step_id: "step_final_synthesis",
      name: "Final Synthesis & Statistics",
      skill: "summarize",
      status: "completed",
      provider: "gemini",
      attempts: 2,
      tool_count: 1,
      usage: {
        prompt_tokens: 680,
        completion_tokens: 160,
      },
      error_category: null,
      created_at: "2026-09-28T10:15:02.510Z",
      started_at: "2026-09-28T10:15:02.520Z",
      completed_at: "2026-09-28T10:15:04.240Z",
    },
  ],
};
