import type { Appointment, AppointmentStatus } from "@/types/models";

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  cancelled: "Cancelado",
  completed: "Concluído",
  confirmed: "Confirmado",
  inProgress: "Em andamento",
  noShow: "Ausente",
  scheduled: "Agendado",
};

const ACTIVE_STATUSES: readonly AppointmentStatus[] = [
  "confirmed",
  "inProgress",
  "scheduled",
];

export function isUpcoming(appointment: Appointment, now = Date.now()) {
  return (
    ACTIVE_STATUSES.includes(appointment.status) &&
    Date.parse(appointment.startsAt) >= now
  );
}

export function getNextAppointment(appointments: Appointment[]) {
  return appointments
    .filter((appointment) => isUpcoming(appointment))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .at(0);
}
