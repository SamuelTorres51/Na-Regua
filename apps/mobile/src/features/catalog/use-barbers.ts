import { useQueryData } from "@/hooks/use-query-data";
import { listBarbers } from "@/services/catalog";
import type { Barber } from "@/types/models";

const NO_BARBERS: Barber[] = [];

export function useBarbers(serviceId?: string) {
  const {
    data: barbers,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useQueryData(
    ["barbers", serviceId ?? "all"],
    () => listBarbers(serviceId),
    NO_BARBERS
  );

  return { barbers, hasLoadError, isLoading, isRefreshing, refresh };
}
