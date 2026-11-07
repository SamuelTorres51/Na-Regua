const TRAILING_SLASH_PATTERN = /\/+$/;
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_ERROR_MESSAGE = "Erro inesperado na comunicação com o servidor.";
const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao servidor.";

export const HTTP_STATUS = {
  conflict: 409,
  network: 0,
  unauthorized: 401,
} as const;

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(
  TRAILING_SLASH_PATTERN,
  ""
);

export const isApiEnabled = API_URL.length > 0;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

interface ApiErrorOptions extends ErrorOptions {
  status: number;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, { status, ...options }: ApiErrorOptions) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
  }
}

export function hasApiStatus(error: unknown, status: number) {
  return error instanceof ApiError && error.status === status;
}

export function isNetworkError(error: unknown) {
  return hasApiStatus(error, HTTP_STATUS.network);
}

type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

interface RequestOptions {
  body?: unknown;
  method?: HttpMethod;
  timeoutMs?: number;
}

interface ValidationIssue {
  msg?: string;
}

function readErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("detail" in payload)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  const { detail } = payload;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const [firstIssue] = detail as ValidationIssue[];
    return firstIssue?.msg ?? DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildHeaders(hasBody: boolean) {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

export async function request<TResponse>(
  path: string,
  { body, method = "GET", timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {}
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const hasBody = body !== undefined;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      body: hasBody ? JSON.stringify(body) : undefined,
      headers: buildHeaders(hasBody),
      method,
      signal: controller.signal,
    });
    const payload = await readPayload(response);

    if (!response.ok) {
      throw new ApiError(readErrorMessage(payload), {
        status: response.status,
      });
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(NETWORK_ERROR_MESSAGE, {
      cause: error,
      status: HTTP_STATUS.network,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  delete: <TResponse>(path: string) =>
    request<TResponse>(path, { method: "DELETE" }),
  get: <TResponse>(path: string, options?: Omit<RequestOptions, "method">) =>
    request<TResponse>(path, { ...options, method: "GET" }),
  patch: <TResponse>(path: string, body: unknown) =>
    request<TResponse>(path, { body, method: "PATCH" }),
  post: <TResponse>(path: string, body: unknown) =>
    request<TResponse>(path, { body, method: "POST" }),
  put: <TResponse>(path: string, body: unknown) =>
    request<TResponse>(path, { body, method: "PUT" }),
};
