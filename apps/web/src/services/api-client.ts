const TRAILING_SLASH_PATTERN = /\/+$/;
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_ERROR_MESSAGE = "Erro inesperado na comunicação com o servidor.";
const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao servidor.";

export const HTTP_STATUS = {
  badRequest: 400,
  conflict: 409,
  forbidden: 403,
  network: 0,
  notFound: 404,
  unauthorized: 401,
  unprocessableEntity: 422,
} as const;

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(
  TRAILING_SLASH_PATTERN,
  ""
);

export const isApiEnabled = API_URL.length > 0;

let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function notifyUnauthorized(sentToken: string | null) {
  if (sentToken && sentToken === accessToken) {
    unauthorizedHandler?.();
  }
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

const USER_FACING_STATUSES = new Set<number>([
  HTTP_STATUS.network,
  HTTP_STATUS.badRequest,
  HTTP_STATUS.forbidden,
  HTTP_STATUS.notFound,
  HTTP_STATUS.conflict,
  HTTP_STATUS.unprocessableEntity,
]);

// Mostra a mensagem da API quando ela explica o problema ao usuário (ex.:
// e-mail já cadastrado); nos demais casos, usa a mensagem da tela.
export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && USER_FACING_STATUSES.has(error.status)) {
    return error.message;
  }

  return fallbackMessage;
}

type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type QueryParams = Record<
  string,
  boolean | number | string | null | undefined
>;

interface RequestOptions {
  body?: unknown;
  method?: HttpMethod;
  query?: QueryParams;
  timeoutMs?: number;
}

type ReadOptions = Omit<RequestOptions, "body" | "method">;

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

function buildUrl(path: string, query: QueryParams = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  }

  const search = params.toString();

  return search ? `${API_URL}${path}?${search}` : `${API_URL}${path}`;
}

function buildHeaders(hasBody: boolean, token: string | null) {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function request<TResponse>(
  path: string,
  {
    body,
    method = "GET",
    query,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: RequestOptions = {}
): Promise<TResponse> {
  const hasBody = body !== undefined;
  const sentToken = accessToken;

  try {
    const response = await fetch(buildUrl(path, query), {
      body: hasBody ? JSON.stringify(body) : undefined,
      headers: buildHeaders(hasBody, sentToken),
      method,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const payload = await readPayload(response);

    if (response.status === HTTP_STATUS.unauthorized) {
      notifyUnauthorized(sentToken);
    }

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
  }
}

export const api = {
  delete: <TResponse>(path: string) =>
    request<TResponse>(path, { method: "DELETE" }),
  get: <TResponse>(path: string, options?: ReadOptions) =>
    request<TResponse>(path, { ...options, method: "GET" }),
  patch: <TResponse>(path: string, body?: unknown) =>
    request<TResponse>(path, { body, method: "PATCH" }),
  post: <TResponse>(path: string, body?: unknown) =>
    request<TResponse>(path, { body, method: "POST" }),
  put: <TResponse>(path: string, body?: unknown) =>
    request<TResponse>(path, { body, method: "PUT" }),
};
