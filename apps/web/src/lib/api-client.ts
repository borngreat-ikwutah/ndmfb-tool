import { serverEnv } from "~/config/env";

const API_BASE_URL = serverEnv.API_URL;

export const DEFAULT_API_TIMEOUT_MS = 5_000;

type ApiRequestOptions = {
  method?: "GET" | "POST";
  cookie?: string;
  body?: unknown;
  timeoutMs?: number;
};

/**
 * An error from the Go API. `unreachable` distinguishes a backend that
 * cannot be reached (network down, API not live) from a real HTTP error,
 * so callers can show a "connecting" state instead of treating it as a
 * failed request.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly unreachable: boolean;
  readonly code: string;

  constructor(
    message: string,
    options: { status?: number; unreachable?: boolean; code: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.unreachable = options.unreachable ?? false;
    this.code = options.code;
  }
}

/** Thin server-side client for the Go API. All server functions call through it. */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    cookie,
    body,
    timeoutMs = DEFAULT_API_TIMEOUT_MS,
  } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(cookie !== undefined ? { cookie } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ApiError("The backend cannot be reached", {
      code: "BACKEND_UNREACHABLE",
      unreachable: true,
    });
  }

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as { message?: string } | null;
    throw new ApiError(
      payload?.message || `API request failed with status ${response.status}`,
      { status: response.status, code: `API_${response.status}` },
    );
  }

  return (await response.json().catch(() => null)) as T;
}

/** True when the Go API could not be reached at all (as opposed to returning an error). */
export function isBackendUnreachable(error: unknown): boolean {
  return error instanceof ApiError && error.unreachable;
}

/** User-facing copy shown whenever the Go API cannot be reached or fails. */
export const API_UNREACHABLE_MESSAGE = "The API is not reachable at the moment.";

/**
 * True when an error is a backend *server* failure — the Go API could not be
 * reached, or it answered with a 5xx. Tolerates errors that crossed the
 * server-function boundary, where the original `ApiError` instance may not
 * survive serialization, by also checking the error code and message.
 */
export function isApiFailure(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.unreachable || error.status >= 500;
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (
      typeof code === "string" &&
      (code === "BACKEND_UNREACHABLE" || /^API_5\d\d$/.test(code))
    ) {
      return true;
    }
  }

  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return (
    /cannot be reached/i.test(message) ||
    /API request failed with status 5\d\d/i.test(message)
  );
}
