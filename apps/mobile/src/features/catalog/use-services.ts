import { useQueryData } from "@/hooks/use-query-data";
import { listServices } from "@/services/catalog";
import type { Service } from "@/types/models";

const NO_SERVICES: Service[] = [];

export function useServices(barberId?: string) {
  const {
    data: services,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useQueryData(
    ["services", barberId ?? "all"],
    () => listServices(barberId),
    NO_SERVICES
  );

  return { hasLoadError, isLoading, isRefreshing, refresh, services };
}
