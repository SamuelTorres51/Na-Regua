import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { useRefocusEffect } from "@/hooks/use-refocus-effect";
import { listBookingDays, listRescheduleDays } from "@/services/availability";
import type { BookingDay, BookingSelectionIds } from "@/types/models";

const NO_DAYS: BookingDay[] = [];

function useScheduleDays(loadDays: () => Promise<BookingDay[]>) {
  const {
    data: days,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
    reload,
  } = useAsyncData(loadDays, NO_DAYS);

  useRefocusEffect(reload);

  return { days, hasLoadError, isLoading, isRefreshing, refresh };
}

export function useBookingDays({ barberId, serviceId }: BookingSelectionIds) {
  const loadDays = useCallback(
    () => listBookingDays({ barberId, serviceId }),
    [barberId, serviceId]
  );

  return useScheduleDays(loadDays);
}

export function useRescheduleDays(appointmentId?: string) {
  const loadDays = useCallback(
    () => listRescheduleDays(appointmentId),
    [appointmentId]
  );

  return useScheduleDays(loadDays);
}
