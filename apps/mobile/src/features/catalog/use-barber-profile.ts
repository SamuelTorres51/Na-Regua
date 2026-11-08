import { useQueryData } from "@/hooks/use-query-data";
import { getBarberProfile } from "@/services/catalog";
import type { BarberProfile } from "@/types/models";

export function useBarberProfile(barberId: string) {
  const {
    data: profile,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useQueryData<BarberProfile | null>(
    ["barber-profile", barberId],
    () => getBarberProfile(barberId),
    null
  );

  return { hasLoadError, isLoading, isRefreshing, profile, refresh };
}
