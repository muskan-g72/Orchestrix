export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
}

export interface ChatResponse {
  content: string;
  usage: TokenUsage;
}

export interface UsageResponse {
  key: string;
  requests: number;
  tokens_in: number;
  tokens_out: number;
  spend: number;
  budget: number;
  remaining: number;
}

export interface TaskRequest {
  skill: string;
  input: Record<string, unknown>;
  preferences?: Record<string, unknown> | null;
}

export interface TaskResponse {
  task_id: string;
  status: "completed";
  skill: string;
  output: Record<string, unknown>;
  provider: string;
  attempts: number;
  usage: TokenUsage;
}

export type AttemptType =
  | "initial"
  | "repair"
  | "fallback"
  | "fallback_repair"
  | "post_tool"
  | "post_tool_repair"
  | "post_tool_fallback"
  | "post_tool_fallback_repair";

export type AttemptStatus =
  | "completed"
  | "validation_error"
  | "operational_error"
  | "configuration_error";

export type ValidationErrorCategory =
  | "parsing"
  | "structure"
  | "semantic"
  | "tool_protocol";

export type ProviderErrorCategory = "operational" | "configuration";

export interface TaskAttemptResponse {
  attempt_number: number;
  provider: string;
  attempt_type: AttemptType;
  status: AttemptStatus;
  usage: TokenUsage;
  validation_error_category: ValidationErrorCategory | null;
  provider_error_category: ProviderErrorCategory | null;
  created_at: string;
}

export interface ToolTraceResponse {
  tool_number: number;
  tool_name: string;
  status: "running" | "completed" | "failed";
  error_category: string | null;
  duration_ms: number;
  created_at: string;
  completed_at: string | null;
}

export interface TaskTraceResponse {
  task_id: string;
  status: "running" | "completed" | "failed";
  skill: string;
  provider: string | null;
  attempts: number;
  usage: TokenUsage;
  error_category: string | null;
  created_at: string;
  completed_at: string | null;
  attempt_history: TaskAttemptResponse[];
  tool_history: ToolTraceResponse[];
}

export interface PreferencesRequest {
  preferences: Record<string, unknown>;
}

export interface PreferencesResponse {
  preferences: Record<string, unknown>;
}

export interface WorkflowRequest {
  workflow: string;
  input: Record<string, unknown>;
  preferences?: Record<string, unknown> | null;
}

export interface WorkflowStepResponse {
  step_order: number;
  step_id: string;
  name: string;
  skill: string;
  status: "completed";
  provider: string;
  attempts: number;
  tool_count: number;
  usage: TokenUsage;
}

export interface WorkflowResponse {
  workflow_id: string;
  status: "completed";
  workflow: string;
  steps: WorkflowStepResponse[];
  output: Record<string, unknown>;
  usage: TokenUsage;
}

export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export interface WorkflowTraceStepResponse {
  step_order: number;
  step_id: string;
  name: string;
  skill: string;
  status: WorkflowStepStatus;
  provider: string | null;
  attempts: number;
  tool_count: number;
  usage: TokenUsage;
  error_category: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface WorkflowTraceResponse {
  workflow_id: string;
  workflow: string;
  name: string;
  description: string;
  status: "running" | "completed" | "failed";
  step_count: number;
  completed_steps: number;
  attempts: number;
  tool_count: number;
  usage: TokenUsage;
  error_category: string | null;
  created_at: string;
  completed_at: string | null;
  steps: WorkflowTraceStepResponse[];
}

export interface HealthResponse {
  status: "ok" | string;
}
