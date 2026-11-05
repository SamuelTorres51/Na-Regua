import type { BarberProfile } from "@/types/models";
import { simulateLatency } from "./fake-api";
import { BARBERS, SERVICES } from "./mock-data";

export async function listServices() {
  await simulateLatency();
  return SERVICES;
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
    services: SERVICES.filter((service) =>
      barber.serviceIds.includes(service.id)
    ),
  };
}
