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
}

export interface BarberProfile {
  barber: Barber;
  services: Service[];
}

export interface BookingSelection {
  barber?: Barber;
  service?: Service;
}

export interface BookingSelectionIds {
  barberId?: string;
  serviceId?: string;
}

export interface BookingRequest {
  barberId: string;
  serviceId: string;
  startsAt: string;
}

export type BookingDayStatus = "available" | "closed" | "dayOff" | "full";

export interface BookingDay {
  date: string;
  slots: string[];
  status: BookingDayStatus;
}

export interface Appointment {
  barber: Barber;
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
