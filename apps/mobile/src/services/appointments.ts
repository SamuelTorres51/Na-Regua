import { simulateLatency } from "./fake-api";
import { createMockAppointments } from "./mock-data";

const appointments = createMockAppointments();

export async function listAppointments() {
  await simulateLatency();

  return [...appointments].sort(
    (a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)
  );
}
