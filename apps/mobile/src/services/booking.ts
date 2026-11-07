import { canRescheduleAppointment } from "@/features/appointments/cancellation";
import type {
  Appointment,
  BookingRequest,
  RescheduleRequest,
} from "@/types/models";
import {
  addAppointment,
  findStoredAppointment,
  getStoredAppointments,
  replaceAppointment,
} from "./appointments";
import { hasAppointmentAt, isSlotAvailable } from "./availability";
import { simulateLatency } from "./fake-api";
import { BARBERS, SERVICES } from "./mock-data";

export type BookingConflictReason = "clientBusy" | "notAllowed" | "unavailable";

export class BookingConflictError extends Error {
  readonly reason: BookingConflictReason;

  constructor(reason: BookingConflictReason) {
    super("Horário indisponível para agendamento.");
    this.name = "BookingConflictError";
    this.reason = reason;
  }
}

export async function createAppointment({
  barberId,
  serviceId,
  startsAt,
}: BookingRequest): Promise<Appointment> {
  await simulateLatency();

  const barber = BARBERS.find((current) => current.id === barberId);
  const service = SERVICES.find((current) => current.id === serviceId);

  if (!(barber && service && isSlotAvailable(barber, service, startsAt))) {
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
