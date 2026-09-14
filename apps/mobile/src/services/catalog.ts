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
