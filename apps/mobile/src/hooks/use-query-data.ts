import { type QueryKey, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export function useQueryData<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  initialData: TData
) {
  const { data, isError, isPending, refetch } = useQuery({ queryFn, queryKey });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  return {
    data: data ?? initialData,
    hasLoadError: isError,
    isLoading: isPending,
    isRefreshing,
    refresh,
  };
}
