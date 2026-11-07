import { useCallback, useState } from "react";

interface AsyncActionOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function useAsyncAction<TInput>(
  action: (input: TInput) => Promise<void>,
  { onError, onSuccess }: AsyncActionOptions = {}
) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    (input: TInput) => {
      setIsRunning(true);
      setError(null);

      action(input)
        .then(() => onSuccess?.())
        .catch((cause: Error) => {
          setError(cause);
          onError?.(cause);
        })
        .finally(() => setIsRunning(false));
    },
    [action, onError, onSuccess]
  );

  return { error, isRunning, run };
}
