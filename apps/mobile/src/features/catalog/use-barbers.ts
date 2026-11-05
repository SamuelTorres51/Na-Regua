import { useAsyncData } from "@/hooks/use-async-data";
import { listBarbers } from "@/services/catalog";
import type { Barber } from "@/types/models";

const NO_BARBERS: Barber[] = [];

export function useBarbers() {
  const {
    data: barbers,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useAsyncData(listBarbers, NO_BARBERS);

  return { barbers, hasLoadError, isLoading, isRefreshing, refresh };
}
