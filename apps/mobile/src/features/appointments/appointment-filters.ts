import { addMinutes } from "date-fns";
import type { Appointment, AppointmentStatus } from "./types";

const PENDING_STATUSES: AppointmentStatus[] = ["confirmed", "scheduled"];

function getStartTime(appointment: Appointment) {
  return new Date(appointment.scheduledAt).getTime();
}

function getEndTime(appointment: Appointment) {
  return addMinutes(
    new Date(appointment.scheduledAt),
    appointment.durationInMinutes
  ).getTime();
}

// "Em atendimento" é sempre próximo. Agendado e confirmado continuam como
// próximos até o horário de término, para não sumirem da lista no meio do
// atendimento caso a barbearia ainda não tenha atualizado o status.
export function isUpcomingAppointment(appointment: Appointment, now: number) {
  if (appointment.status === "inProgress") {
    return true;
  }

  return (
    PENDING_STATUSES.includes(appointment.status) &&
    getEndTime(appointment) >= now
  );
}

export function splitAppointments(
  appointments: Appointment[],
  now = Date.now()
) {
  const upcoming: Appointment[] = [];
  const history: Appointment[] = [];

  for (const appointment of appointments) {
    if (isUpcomingAppointment(appointment, now)) {
      upcoming.push(appointment);
    } else {
      history.push(appointment);
    }
  }

  upcoming.sort((first, second) => getStartTime(first) - getStartTime(second));
  history.sort((first, second) => getStartTime(second) - getStartTime(first));

  return { history, upcoming };
}
