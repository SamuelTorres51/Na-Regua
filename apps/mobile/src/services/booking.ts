import { canRescheduleAppointment } from "@/features/appointments/cancellation";
import type {
  Appointment,
  BookingRequest,
  RescheduleRequest,
} from "@/types/models";
import { ApiError, api, HTTP_STATUS, isApiEnabled } from "./api-client";
import {
  type AppointmentResponse,
  toAppointment,
} from "./appointment-response";
import {
  addAppointment,
  findStoredAppointment,
  getStoredAppointments,
  replaceAppointment,
} from "./appointments";
import {
  findBookableSelection,
  hasAppointmentAt,
  isSlotAvailable,
} from "./availability";
import { simulateLatency } from "./fake-api";

const CLIENT_BUSY_DETAIL = "O cliente já possui";

const UNAVAILABLE_STATUSES: readonly number[] = [
  HTTP_STATUS.conflict,
  HTTP_STATUS.notFound,
  HTTP_STATUS.unprocessable,
];

export type BookingConflictReason = "clientBusy" | "notAllowed" | "unavailable";

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

function toConflictReason(error: unknown): BookingConflictReason | null {
  if (!isUnavailableSlotError(error)) {
    return null;
  }

  return error.message.startsWith(CLIENT_BUSY_DETAIL)
    ? "clientBusy"
    : "unavailable";
}

function rethrowBookingConflict(error: unknown): never {
  const reason = toConflictReason(error);

  if (reason) {
    throw new BookingConflictError(reason);
  }

  throw error;
}

async function createAppointmentWithMock({
  barberId,
  serviceId,
  startsAt,
}: CreateAppointmentInput): Promise<Appointment> {
  await simulateLatency();

  const selection = await findBookableSelection({ barberId, serviceId });

  if (!selection) {
    throw new BookingConflictError("unavailable");
  }

  const { barber, service } = selection;

  if (!isSlotAvailable(barber, service, startsAt)) {
    throw new BookingConflictError("unavailable");
  }

  if (
    hasAppointmentAt(getStoredAppointments(), startsAt, service.durationMinutes)
  ) {
    throw new BookingConflictError("clientBusy");
  }

  const appointment: Appointment = {
    barber,
    id: `apt-${Date.now()}`,
    service,
    startsAt: new Date(startsAt).toISOString(),
    status: "scheduled",
  };

  addAppointment(appointment);

  return appointment;
}

async function createAppointmentWithApi({
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

export const createAppointment = isApiEnabled
  ? createAppointmentWithApi
  : createAppointmentWithMock;

export async function rescheduleAppointment({
  appointmentId,
  startsAt,
}: RescheduleRequest): Promise<Appointment> {
  await simulateLatency();

  const appointment = findStoredAppointment(appointmentId);

  if (!(appointment && canRescheduleAppointment(appointment))) {
    throw new BookingConflictError("notAllowed");
  }

  const { barber, id, service } = appointment;

  if (!isSlotAvailable(barber, service, startsAt, id)) {
    throw new BookingConflictError("unavailable");
  }

  const otherAppointments = getStoredAppointments().filter(
    (current) => current.id !== id
  );

  if (hasAppointmentAt(otherAppointments, startsAt, service.durationMinutes)) {
    throw new BookingConflictError("clientBusy");
  }

  const rescheduled: Appointment = {
    ...appointment,
    startsAt: new Date(startsAt).toISOString(),
    status: "scheduled",
  };

  replaceAppointment(rescheduled);

  return rescheduled;
}
