import { useQueryData } from "@/hooks/use-query-data";
import { listAppointments } from "@/services/appointments";
import type { Appointment } from "@/types/models";

async function findAppointment(appointmentId: string) {
  const appointments = await listAppointments();

  return (
    appointments.find((appointment) => appointment.id === appointmentId) ?? null
  );
}

export function useAppointment(appointmentId: string) {
  const {
    data: appointment,
    hasLoadError,
    isLoading,
  } = useQueryData<Appointment | null>(
    ["appointment", appointmentId],
    () => findAppointment(appointmentId),
    null
  );

  return { appointment, hasLoadError, isLoading };
}
