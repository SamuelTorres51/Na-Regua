import {
  BookingConflictError,
  type BookingConflictReason,
} from "@/services/booking";

export type ConfirmationErrorKind = "conflict" | "failed";

export interface ConfirmationError {
  kind: ConfirmationErrorKind;
  message: string;
}

const CONFLICT_MESSAGES: Record<BookingConflictReason, string> = {
  clientBusy:
    "Você já tem um agendamento nesse horário. Escolha outro horário.",
  unavailable: "Este horário não está mais disponível. Escolha outro horário.",
};

export function toConfirmationError(
  error: unknown,
  failedMessage: string
): ConfirmationError {
  if (!(error instanceof BookingConflictError)) {
    return { kind: "failed", message: failedMessage };
  }

  return { kind: "conflict", message: CONFLICT_MESSAGES[error.reason] };
}
