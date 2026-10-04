import type { Appointment, AppointmentStatus } from "@/types/models";

const MS_PER_MINUTE = 60_000;

// RF34 (Could): prazo mínimo de antecedência para o cliente cancelar.
// Fixo por enquanto; quando virar configuração da barbearia, vem da API.
export const MIN_CANCEL_NOTICE_MINUTES = 60;

const CANCELLABLE_STATUSES: readonly AppointmentStatus[] = [
  "confirmed",
  "scheduled",
];

export type CancellationState = "allowed" | "notAllowed" | "tooLate";

export function getCancellationState(
  appointment: Appointment,
  now = Date.now()
): CancellationState {
  if (!CANCELLABLE_STATUSES.includes(appointment.status)) {
    return "notAllowed";
  }

  const minutesUntilStart =
    (Date.parse(appointment.startsAt) - now) / MS_PER_MINUTE;

  return minutesUntilStart >= MIN_CANCEL_NOTICE_MINUTES ? "allowed" : "tooLate";
}
