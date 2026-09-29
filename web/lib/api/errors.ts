export class OrchestrixApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly detail?: string;
  readonly payload?: unknown;

  constructor(
    message: string,
    status: number,
    statusText: string,
    detail?: string,
    payload?: unknown
  ) {
    super(message);
    this.name = "OrchestrixApiError";
    this.status = status;
    this.statusText = statusText;
    this.detail = detail;
    this.payload = payload;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 401: Missing, malformed, or unknown virtual key */
export class UnauthorizedError extends OrchestrixApiError {
  constructor(detail = "Missing or unknown virtual key", payload?: unknown) {
    super(
      `[401 Unauthorized] ${detail}`,
      401,
      "Unauthorized",
      detail,
      payload
    );
    this.name = "UnauthorizedError";
  }
}

/** 404: Unknown skill, workflow, task trace, or non-owned trace */
export class NotFoundError extends OrchestrixApiError {
  constructor(detail = "Resource or trace not found", payload?: unknown) {
    super(`[404 Not Found] ${detail}`, 404, "Not Found", detail, payload);
    this.name = "NotFoundError";
  }
}

/** 422: Invalid request shape, task input, workflow input, or preference value */
export class ValidationError extends OrchestrixApiError {
  constructor(detail = "Invalid input or request schema", payload?: unknown) {
    super(
      `[422 Unprocessable Entity] ${detail}`,
      422,
      "Unprocessable Entity",
      detail,
      payload
    );
    this.name = "ValidationError";
  }
}

/** 429: Virtual-key request budget exhausted */
export class BudgetExhaustedError extends OrchestrixApiError {
  constructor(detail = "Virtual key budget exhausted", payload?: unknown) {
    super(
      `[429 Too Many Requests] ${detail}`,
      429,
      "Too Many Requests",
      detail,
      payload
    );
    this.name = "BudgetExhaustedError";
  }
}

/** 500: Gateway configuration, persistence, tracing, or accounting failure */
export class InternalGatewayError extends OrchestrixApiError {
  constructor(
    detail = "Internal gateway configuration or persistence failure",
    payload?: unknown
  ) {
    super(
      `[500 Internal Server Error] ${detail}`,
      500,
      "Internal Server Error",
      detail,
      payload
    );
    this.name = "InternalGatewayError";
  }
}

/** 502: Providers unavailable, invalid output after bounded repair, tool failure, or step failure */
export class ProviderUnavailableError extends OrchestrixApiError {
  constructor(
    detail = "Upstream providers unavailable or bounded repair/tools exhausted",
    payload?: unknown
  ) {
    super(
      `[502 Bad Gateway] ${detail}`,
      502,
      "Bad Gateway",
      detail,
      payload
    );
    this.name = "ProviderUnavailableError";
  }
}

export function mapHttpError(
  status: number,
  statusText: string,
  detail?: string,
  payload?: unknown
): OrchestrixApiError {
  switch (status) {
    case 401:
      return new UnauthorizedError(detail, payload);
    case 404:
      return new NotFoundError(detail, payload);
    case 422:
      return new ValidationError(detail, payload);
    case 429:
      return new BudgetExhaustedError(detail, payload);
    case 500:
      return new InternalGatewayError(detail, payload);
    case 502:
      return new ProviderUnavailableError(detail, payload);
    default:
      return new OrchestrixApiError(
        detail || `HTTP Error ${status}: ${statusText}`,
        status,
        statusText,
        detail,
        payload
      );
  }
}
