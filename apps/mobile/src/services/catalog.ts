import type {
  Barber,
  BarberProfile,
  BookingSelection,
  BookingSelectionIds,
} from "@/types/models";
import { simulateLatency } from "./fake-api";
import { BARBERS, SERVICES } from "./mock-data";

function filterServicesByBarber(barber: Barber) {
  return SERVICES.filter((service) => barber.serviceIds.includes(service.id));
}

export async function listServices(barberId?: string) {
  await simulateLatency();

  if (!barberId) {
    return SERVICES;
  }

  const barber = BARBERS.find((current) => current.id === barberId);

  return barber ? filterServicesByBarber(barber) : [];
}

export async function listBarbers(serviceId?: string) {
  await simulateLatency();

  if (!serviceId) {
    return BARBERS;
  }

  return BARBERS.filter((b) => b.serviceIds.includes(serviceId));
}

export async function getBarberProfile(
  barberId: string
): Promise<BarberProfile | null> {
  await simulateLatency();

  const barber = BARBERS.find((current) => current.id === barberId);

  if (!barber) {
    return null;
  }

  return {
    barber,
    services: filterServicesByBarber(barber),
  };
}

export async function getBookingSelection({
  barberId,
  serviceId,
}: BookingSelectionIds): Promise<BookingSelection> {
  await simulateLatency();

  return {
    barber: BARBERS.find((barber) => barber.id === barberId),
    service: SERVICES.find((service) => service.id === serviceId),
  };
}
