import type { AppointmentStatus } from "./types";

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  cancelled: "Cancelado",
  completed: "Concluído",
  confirmed: "Confirmado",
  inProgress: "Em atendimento",
  missed: "Ausente",
  scheduled: "Agendado",
};
