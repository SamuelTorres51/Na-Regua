import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api-client";

interface ReviewQueryResult<T> {
  attempt: number;
  data: T | null;
  error: string | null;
  load: () => Promise<T>;
}

export function useReviewsQuery<T>(
  load: () => Promise<T>,
  errorMessage: string
) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<ReviewQueryResult<T> | null>(null);

  useEffect(() => {
    let isActive = true;
    load()
      .then((data) => {
        if (isActive) {
          setResult({ attempt, data, error: null, load });
        }
      })
      .catch((failure) => {
        if (isActive) {
          setResult({
            attempt,
            data: null,
            error: getApiErrorMessage(failure, errorMessage),
            load,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [attempt, errorMessage, load]);

  const current =
    result?.load === load && result.attempt === attempt ? result : null;
  const retry = useCallback(() => setAttempt((previous) => previous + 1), []);

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    retry,
  };
}
