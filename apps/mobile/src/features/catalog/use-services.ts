import { useCallback, useEffect, useState } from "react";
import { listServices } from "@/services/catalog";
import type { Service } from "@/types/models";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  const loadServices = useCallback(async () => {
    try {
      setServices(await listServices());
      setHasLoadError(false);
    } catch {
      setHasLoadError(true);
    }
  }, []);

  useEffect(() => {
    loadServices().finally(() => setIsLoading(false));
  }, [loadServices]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadServices();
    setIsRefreshing(false);
  }, [loadServices]);

  return { hasLoadError, isLoading, isRefreshing, refresh, services };
}
