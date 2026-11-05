import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { getBarberProfile } from "@/services/catalog";
import type { BarberProfile } from "@/types/models";

export function useBarberProfile(barberId: string) {
  const loadProfile = useCallback(() => getBarberProfile(barberId), [barberId]);

  const {
    data: profile,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useAsyncData<BarberProfile | null>(loadProfile, null);

  return { hasLoadError, isLoading, isRefreshing, profile, refresh };
}
