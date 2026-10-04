// Status do atendimento conforme RF36.
export type AppointmentStatus =
  | "cancelled"
  | "completed"
  | "confirmed"
  | "inProgress"
  | "missed"
  | "scheduled";

export interface Appointment {
  barberName: string;
  durationInMinutes: number;
  id: string;
  priceInCents: number;
  scheduledAt: string;
  serviceName: string;
  status: AppointmentStatus;
}
