import { api, HTTP_STATUS, hasApiStatus } from "./api-client";
import {
  type AppointmentResponse,
  toAppointment,
} from "./appointment-response";

const CANCELLATION_REASON = "Cancelado pelo cliente no app.";

export class AppointmentNotCancellableError extends Error {
  constructor() {
    super("O agendamento não pode mais ser cancelado.");
    this.name = "AppointmentNotCancellableError";
  }
}

function rethrowNotCancellable(error: unknown): never {
  if (hasApiStatus(error, HTTP_STATUS.conflict)) {
    throw new AppointmentNotCancellableError();
  }

  throw error;
}

export async function listAppointments() {
  const responses = await api.get<AppointmentResponse[]>("/agendamentos");

  return responses.map(toAppointment);
}

export async function cancelAppointment(appointmentId: string) {
  try {
    await api.post(`/agendamentos/${appointmentId}/cancelar`, {
      motivo: CANCELLATION_REASON,
    });
  } catch (error) {
    rethrowNotCancellable(error);
  }
}
