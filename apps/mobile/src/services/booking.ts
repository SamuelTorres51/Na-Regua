import type { Appointment, BookingRequest } from "@/types/models";
import { ApiError, api, HTTP_STATUS } from "./api-client";
import {
  type AppointmentResponse,
  toAppointment,
} from "./appointment-response";

const CLIENT_BUSY_DETAIL = "O cliente já possui";

const UNAVAILABLE_STATUSES: readonly number[] = [
  HTTP_STATUS.conflict,
  HTTP_STATUS.notFound,
  HTTP_STATUS.unprocessable,
];

export type BookingConflictReason = "clientBusy" | "unavailable";

export class BookingConflictError extends Error {
  readonly reason: BookingConflictReason;

  constructor(reason: BookingConflictReason) {
    super("Horário indisponível para agendamento.");
    this.name = "BookingConflictError";
    this.reason = reason;
  }
}

export interface CreateAppointmentInput extends BookingRequest {
  clientId: string;
}

function isUnavailableSlotError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError && UNAVAILABLE_STATUSES.includes(error.status)
  );
}

function rethrowBookingConflict(error: unknown): never {
  if (!isUnavailableSlotError(error)) {
    throw error;
  }

  throw new BookingConflictError(
    error.message.startsWith(CLIENT_BUSY_DETAIL) ? "clientBusy" : "unavailable"
  );
}

export async function createAppointment({
  barberId,
  clientId,
  serviceId,
  startsAt,
}: CreateAppointmentInput): Promise<Appointment> {
  try {
    const response = await api.post<AppointmentResponse>("/agendamentos", {
      cliente_id: Number(clientId),
      inicio: new Date(startsAt).toISOString(),
      profissional_id: Number(barberId),
      servico_id: Number(serviceId),
    });

    return toAppointment(response);
  } catch (error) {
    return rethrowBookingConflict(error);
  }
}
