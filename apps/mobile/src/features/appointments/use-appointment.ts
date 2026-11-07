import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { getAppointment } from "@/services/appointments";

export function useAppointment(appointmentId?: string) {
  const loadAppointment = useCallback(
    () => getAppointment(appointmentId),
    [appointmentId]
  );

  const { data: appointment } = useAsyncData(loadAppointment, null);

  return appointment;
}
