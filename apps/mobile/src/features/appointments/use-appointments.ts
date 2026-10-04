import { useCallback, useEffect, useState } from "react";
import {
  listAppointments,
  cancelAppointment as requestCancelAppointment,
} from "@/services/appointments";
import type { Appointment } from "@/types/models";

// PROVISÓRIO: quando a API existir, o corpo vira useQuery para a lista e
// useMutation para o cancelamento; o retorno mantém a mesma forma para a tela
// não precisar mudar.
export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      setAppointments(await listAppointments());
      setHasLoadError(false);
    } catch {
      setHasLoadError(true);
    }
  }, []);

  useEffect(() => {
    loadAppointments().finally(() => setIsLoading(false));
  }, [loadAppointments]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAppointments();
    setIsRefreshing(false);
  }, [loadAppointments]);

  const cancelAppointment = useCallback(async (appointmentId: string) => {
    setCancellingId(appointmentId);

    try {
      const cancelled = await requestCancelAppointment(appointmentId);

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === cancelled.id ? cancelled : appointment
        )
      );
    } finally {
      setCancellingId(null);
    }
  }, []);

  return {
    appointments,
    cancelAppointment,
    cancellingId,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  };
}
