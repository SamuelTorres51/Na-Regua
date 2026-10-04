import { differenceInMinutes } from "date-fns";
import type { Appointment, AppointmentStatus } from "./types";

// RF34 (Could): prazo mínimo de antecedência para o cliente cancelar.
// Fixo por enquanto; quando virar configuração da barbearia, vem da API.
export const MIN_CANCEL_NOTICE_MINUTES = 60;

const CANCELLABLE_STATUSES: AppointmentStatus[] = ["confirmed", "scheduled"];

export type CancellationState = "allowed" | "notAllowed" | "tooLate";

export function getCancellationState(
  appointment: Appointment,
  now = new Date()
): CancellationState {
  if (!CANCELLABLE_STATUSES.includes(appointment.status)) {
    return "notAllowed";
  }

  const minutesUntilStart = differenceInMinutes(
    new Date(appointment.scheduledAt),
    now
  );

  return minutesUntilStart >= MIN_CANCEL_NOTICE_MINUTES ? "allowed" : "tooLate";
}
