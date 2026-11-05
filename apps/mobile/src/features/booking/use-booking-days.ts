import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { listBookingDays } from "@/services/availability";
import type { BookingDay, BookingSelectionIds } from "@/types/models";

const NO_DAYS: BookingDay[] = [];

export function useBookingDays({ barberId, serviceId }: BookingSelectionIds) {
  const loadDays = useCallback(
    () => listBookingDays({ barberId, serviceId }),
    [barberId, serviceId]
  );

  const {
    data: days,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useAsyncData(loadDays, NO_DAYS);

  return { days, hasLoadError, isLoading, isRefreshing, refresh };
}
