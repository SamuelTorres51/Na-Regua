import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { listServices } from "@/services/catalog";
import type { Service } from "@/types/models";

const NO_SERVICES: Service[] = [];

export function useServices(barberId?: string) {
  const loadServices = useCallback(() => listServices(barberId), [barberId]);
  const {
    data: services,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useAsyncData(loadServices, NO_SERVICES);

  return { hasLoadError, isLoading, isRefreshing, refresh, services };
}
