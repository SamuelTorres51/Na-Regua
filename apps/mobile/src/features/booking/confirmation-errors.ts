import {
  BookingConflictError,
  type BookingConflictReason,
} from "@/services/booking";

export type ConfirmationErrorKind = "conflict" | "failed" | "notAllowed";

export interface ConfirmationError {
  kind: ConfirmationErrorKind;
  message: string;
}

const CONFLICT_MESSAGES: Record<BookingConflictReason, string> = {
  clientBusy:
    "Você já tem um agendamento nesse horário. Escolha outro horário.",
  notAllowed:
    "Este agendamento não pode mais ser alterado. Confira em Agendamentos.",
  unavailable: "Este horário não está mais disponível. Escolha outro horário.",
};

export function toConfirmationError(
  error: unknown,
  failedMessage: string
): ConfirmationError {
  if (!(error instanceof BookingConflictError)) {
    return { kind: "failed", message: failedMessage };
  }

  return {
    kind: error.reason === "notAllowed" ? "notAllowed" : "conflict",
    message: CONFLICT_MESSAGES[error.reason],
  };
}
