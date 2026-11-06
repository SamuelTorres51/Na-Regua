import { useCallback, useEffect, useState } from "react";

export function useAsyncData<TData>(
  load: () => Promise<TData>,
  initialData: TData
) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setData(await load());
      setHasLoadError(false);
    } catch {
      setHasLoadError(true);
    }
  }, [load]);

  useEffect(() => {
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  return {
    data,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
    reload: loadData,
  };
}
