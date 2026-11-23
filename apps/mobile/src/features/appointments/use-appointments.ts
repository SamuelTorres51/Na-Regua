import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  cancelAppointmentReminder,
  syncAppointmentReminders,
} from "@/services/appointment-reminders";
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
      const nextAppointments = await listAppointments();
      setAppointments(nextAppointments);
      setHasLoadError(false);
      syncAppointmentReminders(nextAppointments);
    } catch {
      setHasLoadError(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAppointments().finally(() => setIsLoading(false));
    }, [loadAppointments])
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAppointments();
    setIsRefreshing(false);
  }, [loadAppointments]);

  const cancelAppointment = useCallback(
    async (appointmentId: string) => {
      setIsCancelling(true);

      try {
        await requestCancelAppointment(appointmentId);
        cancelAppointmentReminder(appointmentId);

        setAppointments((current) =>
          current.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, status: "cancelled" }
              : appointment
          )
        );
      } catch (error) {
        await loadAppointments();
        throw error;
      } finally {
        setIsCancelling(false);
      }
    },
    [loadAppointments]
  );

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
