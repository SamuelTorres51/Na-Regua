import { useCallback, useEffect, useState } from "react";
import {
  listAppointments,
  cancelAppointment as requestCancelAppointment,
} from "@/services/appointments";
import type { Appointment } from "@/types/models";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

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
    setIsCancelling(true);

    try {
      const cancelled = await requestCancelAppointment(appointmentId);

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === cancelled.id ? cancelled : appointment
        )
      );
    } finally {
      setIsCancelling(false);
    }
  }, []);

  return {
    appointments,
    cancelAppointment,
    hasLoadError,
    isCancelling,
    isLoading,
    isRefreshing,
    refresh,
  };
}
