import type { Appointment, AppointmentStatus } from "@/types/models";

const MS_PER_MINUTE = 60_000;

// Rótulos conforme o RF36.
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  cancelled: "Cancelado",
  completed: "Concluído",
  confirmed: "Confirmado",
  inProgress: "Em atendimento",
  noShow: "Ausente",
  scheduled: "Agendado",
};

const PENDING_STATUSES: readonly AppointmentStatus[] = [
  "confirmed",
  "scheduled",
];

function getStartTime(appointment: Appointment) {
  return Date.parse(appointment.startsAt);
}

function getEndTime(appointment: Appointment) {
  return (
    getStartTime(appointment) +
    appointment.service.durationMinutes * MS_PER_MINUTE
  );
}

// "Em atendimento" é sempre próximo. Agendado e confirmado continuam como
// próximos até o fim do atendimento, para não sumirem da lista no meio do
// horário caso a barbearia ainda não tenha atualizado o status.
export function isUpcoming(appointment: Appointment, now = Date.now()) {
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
    if (isUpcoming(appointment, now)) {
      upcoming.push(appointment);
    } else {
      history.push(appointment);
    }
  }

  upcoming.sort((a, b) => getStartTime(a) - getStartTime(b));
  history.sort((a, b) => getStartTime(b) - getStartTime(a));

  return { history, upcoming };
}

export function getNextAppointment(appointments: Appointment[]) {
  return splitAppointments(appointments).upcoming.at(0);
}
