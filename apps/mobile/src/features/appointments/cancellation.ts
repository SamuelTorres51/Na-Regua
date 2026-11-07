import type { Appointment, AppointmentStatus } from "@/types/models";
import { formatDuration } from "@/utils/format";

const MS_PER_MINUTE = 60_000;

export const MIN_CANCEL_NOTICE_MINUTES = 60;

export const CHANGE_POLICY_MESSAGE = `Você pode reagendar ou cancelar pelo app até ${formatDuration(MIN_CANCEL_NOTICE_MINUTES)} antes do horário.`;

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

export function canRescheduleAppointment(
  appointment: Appointment,
  now = Date.now()
) {
  return getCancellationState(appointment, now) === "allowed";
}
