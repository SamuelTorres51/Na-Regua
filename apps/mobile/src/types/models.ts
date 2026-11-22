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

export interface BarberRating {
  average: number | null;
  total: number;
}

export interface BarberProfile {
  barber: Barber;
  rating: BarberRating | null;
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

export interface Review {
  appointmentId: string;
  comment: string;
  createdAt: string;
  id: string;
  rating: number;
}

export interface ReviewHistoryItem {
  appointment?: Appointment;
  review: Review;
}

export type NotificationKind =
  | "cancellation"
  | "confirmation"
  | "general"
  | "reminder";

export interface AppNotification {
  appointmentId?: string;
  id: string;
  isRead: boolean;
  kind: NotificationKind;
  message: string;
  sentAt: string;
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
