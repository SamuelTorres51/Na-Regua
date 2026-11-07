import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-client";

const MAX_RETRIES = 2;
const STALE_TIME_MS = 30_000;
const CLIENT_ERROR_MIN_STATUS = 400;
const SERVER_ERROR_MIN_STATUS = 500;

function isClientError(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status >= CLIENT_ERROR_MIN_STATUS &&
    error.status < SERVER_ERROR_MIN_STATUS
  );
}

function shouldRetry(failureCount: number, error: unknown) {
  return !isClientError(error) && failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
    queries: { retry: shouldRetry, staleTime: STALE_TIME_MS },
  },
});
