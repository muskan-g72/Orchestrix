import {
  ChatRequest,
  ChatResponse,
  HealthResponse,
  PreferencesRequest,
  PreferencesResponse,
  TaskRequest,
  TaskResponse,
  TaskTraceResponse,
  UsageResponse,
  WorkflowRequest,
  WorkflowResponse,
  WorkflowTraceResponse,
} from "./types";
import {
  BudgetExhaustedError,
  NotFoundError,
  OrchestrixApiError,
  UnauthorizedError,
  ValidationError,
  mapHttpError,
} from "./errors";
import {
  MOCK_CHAT_RESPONSE,
  MOCK_HEALTH,
  MOCK_PREFERENCES,
  MOCK_TASK_EXECUTION,
  MOCK_TASK_TRACE,
  MOCK_USAGE,
  MOCK_WORKFLOW_EXECUTION,
  MOCK_WORKFLOW_TRACE,
} from "./mock-data";

export interface OrchestrixClientConfig {
  baseUrl?: string;
  defaultVirtualKey?: string;
  mock?: boolean;
  useProxy?: boolean;
}

export class OrchestrixClient {
  readonly baseUrl: string;
  readonly defaultVirtualKey?: string;
  readonly isMock: boolean;
  readonly useProxy: boolean;

  constructor(config: OrchestrixClientConfig = {}) {
    // Default to LIVE mode; only mock if NEXT_PUBLIC_MOCK is explicitly "1"
    this.isMock =
      config.mock ??
      process.env.NEXT_PUBLIC_MOCK === "1";

    this.useProxy = config.useProxy ?? true;

    // When useProxy is true, browser requests hit Next.js route handlers (/api/...)
    // keeping virtual keys and backend host server-side.
    if (this.useProxy && typeof window !== "undefined") {
      this.baseUrl = "";
    } else {
      this.baseUrl = (
        config.baseUrl ||
        process.env.NEXT_PUBLIC_API_URL ||
        "https://orchestrix-yc6s.onrender.com"
      ).replace(/\/+$/, "");
    }

    this.defaultVirtualKey =
      config.defaultVirtualKey ||
      process.env.NEXT_PUBLIC_DEFAULT_VIRTUAL_KEY ||
      "vk_open";
  }

  private resolveKey(explicitKey?: string): string {
    return explicitKey || this.defaultVirtualKey || "vk_open";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { key?: string; skipAuth?: boolean } = {}
  ): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");

    if (!options.skipAuth && options.key) {
      headers.set("Authorization", `Bearer ${options.key}`);
    }

    // Map endpoint path depending on proxy mode
    let targetPath = endpoint;
    if (this.useProxy) {
      if (endpoint === "/healthz") targetPath = "/api/healthz";
      else if (endpoint.startsWith("/usage")) targetPath = `/api${endpoint}`;
      else if (endpoint.startsWith("/v1/")) targetPath = `/api/${endpoint.slice(4)}`;
      else if (!endpoint.startsWith("/api/")) targetPath = `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    }

    const url = `${this.baseUrl}${targetPath}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network or fetch failure";
      throw new OrchestrixApiError(
        `Failed to reach Orchestrix gateway at ${url}: ${message}`,
        500,
        "Fetch Failure",
        message
      );
    }

    if (!response.ok) {
      let detail: string | undefined;
      let payload: unknown;
      try {
        const json = await response.json();
        payload = json;
        detail = json.detail || json.message || json.error;
      } catch {
        detail = await response.text().catch(() => undefined);
      }

      throw mapHttpError(response.status, response.statusText, detail, payload);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return (await response.json()) as T;
  }

  private async mockDelay(ms = 350): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 1. POST /v1/chat/completions
  async createChatCompletion(
    request: ChatRequest,
    virtualKey?: string
  ): Promise<ChatResponse> {
    if (this.isMock) {
      await this.mockDelay(400);
      const key = this.resolveKey(virtualKey);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      if (key === "vk_exhausted") {
        throw new BudgetExhaustedError("virtual key budget exhausted");
      }
      return {
        ...MOCK_CHAT_RESPONSE,
        content: `Deterministic response from Orchestrix [provider: Groq, model: ${request.model}]. User query received: "${request.messages[request.messages.length - 1]?.content.slice(0, 50)}..."`,
      };
    }

    return this.request<ChatResponse>("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify(request),
      key: virtualKey,
    });
  }

  // 2. POST /v1/tasks/execute
  async executeTask(
    request: TaskRequest,
    virtualKey?: string
  ): Promise<TaskResponse> {
    if (this.isMock) {
      await this.mockDelay(550);
      const key = this.resolveKey(virtualKey);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      if (key === "vk_exhausted") {
        throw new BudgetExhaustedError("virtual key budget exhausted");
      }
      if (!request.skill) {
        throw new ValidationError("skill must contain text");
      }
      return {
        ...MOCK_TASK_EXECUTION,
        skill: request.skill,
        task_id: crypto.randomUUID?.() || `task-${Date.now()}`,
      };
    }

    return this.request<TaskResponse>("/v1/tasks/execute", {
      method: "POST",
      body: JSON.stringify(request),
      key: virtualKey,
    });
  }

  // 3. GET /v1/tasks/{id}
  async getTaskTrace(
    taskId: string,
    virtualKey?: string
  ): Promise<TaskTraceResponse> {
    if (this.isMock) {
      await this.mockDelay(300);
      const key = this.resolveKey(virtualKey);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      if (taskId === "not_found" || taskId === "missing") {
        throw new NotFoundError("task not found");
      }
      return {
        ...MOCK_TASK_TRACE,
        task_id: taskId,
      };
    }

    return this.request<TaskTraceResponse>(`/v1/tasks/${taskId}`, {
      method: "GET",
      key: virtualKey,
    });
  }

  // 4. POST /v1/workflows/execute
  async executeWorkflow(
    request: WorkflowRequest,
    virtualKey?: string
  ): Promise<WorkflowResponse> {
    if (this.isMock) {
      await this.mockDelay(750);
      const key = this.resolveKey(virtualKey);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      if (key === "vk_exhausted") {
        throw new BudgetExhaustedError("virtual key budget exhausted");
      }
      if (request.workflow !== "article_processing") {
        throw new NotFoundError("unknown workflow");
      }
      return {
        ...MOCK_WORKFLOW_EXECUTION,
        workflow: request.workflow,
        workflow_id: crypto.randomUUID?.() || `wf-${Date.now()}`,
      };
    }

    return this.request<WorkflowResponse>("/v1/workflows/execute", {
      method: "POST",
      body: JSON.stringify(request),
      key: virtualKey,
    });
  }

  // 5. GET /v1/workflows/{id}
  async getWorkflowTrace(
    workflowId: string,
    virtualKey?: string
  ): Promise<WorkflowTraceResponse> {
    if (this.isMock) {
      await this.mockDelay(350);
      const key = this.resolveKey(virtualKey);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      if (workflowId === "not_found" || workflowId === "missing") {
        throw new NotFoundError("workflow not found");
      }
      return {
        ...MOCK_WORKFLOW_TRACE,
        workflow_id: workflowId,
      };
    }

    return this.request<WorkflowTraceResponse>(`/v1/workflows/${workflowId}`, {
      method: "GET",
      key: virtualKey,
    });
  }

  // 6. GET /v1/preferences
  async getPreferences(virtualKey?: string): Promise<PreferencesResponse> {
    if (this.isMock) {
      await this.mockDelay(250);
      const key = this.resolveKey(virtualKey);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      return MOCK_PREFERENCES;
    }

    return this.request<PreferencesResponse>("/v1/preferences", {
      method: "GET",
      key: virtualKey,
    });
  }

  // 7. PUT /v1/preferences
  async setPreferences(
    request: PreferencesRequest,
    virtualKey?: string
  ): Promise<PreferencesResponse> {
    if (this.isMock) {
      await this.mockDelay(300);
      const key = this.resolveKey(virtualKey);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      return {
        preferences: {
          ...MOCK_PREFERENCES.preferences,
          ...request.preferences,
        },
      };
    }

    return this.request<PreferencesResponse>("/v1/preferences", {
      method: "PUT",
      body: JSON.stringify(request),
      key: virtualKey,
    });
  }

  // 8. DELETE /v1/preferences/{preference_key}
  async deletePreference(
    preferenceKey: string,
    virtualKey?: string
  ): Promise<void> {
    if (this.isMock) {
      await this.mockDelay(200);
      const key = this.resolveKey(virtualKey);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      return;
    }

    return this.request<void>(`/v1/preferences/${preferenceKey}`, {
      method: "DELETE",
      key: virtualKey,
    });
  }

  // 9. GET /usage?key=
  async getUsage(virtualKey?: string): Promise<UsageResponse> {
    const key = this.resolveKey(virtualKey);
    if (this.isMock) {
      await this.mockDelay(200);
      if (key === "invalid_key") {
        throw new UnauthorizedError("missing or unknown virtual key");
      }
      return {
        ...MOCK_USAGE,
        key,
      };
    }

    return this.request<UsageResponse>(`/usage?key=${encodeURIComponent(key)}`, {
      method: "GET",
      skipAuth: true,
    });
  }

  // 10. GET /healthz
  async getHealth(): Promise<HealthResponse> {
    if (this.isMock) {
      await this.mockDelay(100);
      return MOCK_HEALTH;
    }

    return this.request<HealthResponse>("/healthz", {
      method: "GET",
      skipAuth: true,
    });
  }
}

// Singleton default client instance
export const api = new OrchestrixClient();
