import type { Appointment, BookingRequest } from "@/types/models";
import { addAppointment, getStoredAppointments } from "./appointments";
import { hasAppointmentAt, isSlotAvailable } from "./availability";
import { simulateLatency } from "./fake-api";
import { BARBERS, SERVICES } from "./mock-data";

export type BookingConflictReason = "clientBusy" | "unavailable";

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
