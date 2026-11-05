import type { BookingDayStatus } from "@/types/models";

const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 18;

export type UnavailableDayStatus = Exclude<BookingDayStatus, "available">;

export const DAY_STATUS_LABELS: Record<UnavailableDayStatus, string> = {
  closed: "Fechado",
  dayOff: "Folga",
  full: "Sem vagas",
};

export type DayPeriod = "afternoon" | "evening" | "morning";

export const DAY_PERIOD_LABELS: Record<DayPeriod, string> = {
  afternoon: "Tarde",
  evening: "Noite",
  morning: "Manhã",
};

const DAY_PERIOD_ORDER: readonly DayPeriod[] = [
  "morning",
  "afternoon",
  "evening",
];

export interface SlotGroup {
  period: DayPeriod;
  slots: string[];
}

function getDayPeriod(startsAt: string): DayPeriod {
  const hour = new Date(startsAt).getHours();

  if (hour < AFTERNOON_START_HOUR) {
    return "morning";
  }

  if (hour < EVENING_START_HOUR) {
    return "afternoon";
  }

  return "evening";
}

export function groupSlotsByPeriod(slots: string[]): SlotGroup[] {
  return DAY_PERIOD_ORDER.map((period) => ({
    period,
    slots: slots.filter((slot) => getDayPeriod(slot) === period),
  })).filter((group) => group.slots.length > 0);
}

export function describeFreeSlots(count: number) {
  return count === 1 ? "1 horário livre" : `${count} horários livres`;
}
