export type AppointmentsTab = "history" | "upcoming";

export function isAppointmentsTab(value: unknown): value is AppointmentsTab {
  return value === "history" || value === "upcoming";
}
