import { useAsyncData } from "@/hooks/use-async-data";
import { listServices } from "@/services/catalog";
import type { Service } from "@/types/models";

const NO_SERVICES: Service[] = [];

export function useServices() {
  const {
    data: services,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useAsyncData(listServices, NO_SERVICES);

  return { hasLoadError, isLoading, isRefreshing, refresh, services };
}
