import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { listBarbers } from "@/services/catalog";
import type { Barber } from "@/types/models";

const NO_BARBERS: Barber[] = [];

export function useBarbers(serviceId?: string) {
  const loadBarbers = useCallback(() => listBarbers(serviceId), [serviceId]);
  const {
    data: barbers,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useAsyncData(loadBarbers, NO_BARBERS);

  return { barbers, hasLoadError, isLoading, isRefreshing, refresh };
}
