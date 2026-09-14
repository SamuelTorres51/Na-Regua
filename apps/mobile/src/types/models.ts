export type AppointmentStatus =
  | "cancelled"
  | "completed"
  | "confirmed"
  | "inProgress"
  | "noShow"
  | "scheduled";

export interface Service {
  description: string;
  durationMinutes: number;
  id: string;
  name: string;
  priceInCents: number;
}

export interface Barber {
  id: string;
  name: string;
  serviceIds: string[];
  specialities: string[];
}

export interface Appointment {
  barber: Barber;
  cancelledAt?: string;
  id: string;
  service: Service;
  startsAt: string;
  status: AppointmentStatus;
}

export interface User {
  email: string;
  fullName: string;
  id: string;
  phone: string;
}

export interface AuthSession {
  token: string;
  user: User;
}
