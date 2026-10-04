import type { Appointment } from "@/types/models";
import { simulateLatency } from "./fake-api";
import { createMockAppointments } from "./mock-data";

const appointments = createMockAppointments();

export async function listAppointments() {
  await simulateLatency();

  return [...appointments].sort(
    (a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)
  );
}

// PROVISÓRIO: troca o item no "banco" em memória por uma cópia cancelada, sem
// mutar objetos que a tela já tem em estado. Na API, o cancelamento também
// registra o autor (RN13).
export async function cancelAppointment(
  appointmentId: string
): Promise<Appointment> {
  await simulateLatency();

  const index = appointments.findIndex(
    (appointment) => appointment.id === appointmentId
  );

  if (index === -1) {
    throw new Error(`Agendamento não encontrado: ${appointmentId}`);
  }

  const cancelled: Appointment = {
    ...appointments[index],
    cancelledAt: new Date().toISOString(),
    status: "cancelled",
  };

  appointments[index] = cancelled;

  return cancelled;
}
