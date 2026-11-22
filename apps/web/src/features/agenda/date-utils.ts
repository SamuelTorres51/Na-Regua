import type { AgendaView } from "./types";

export const TIME_SLOT_START_MINUTES = 8 * 60;
export const TIME_SLOT_END_MINUTES = 20 * 60;
export const TIME_SLOT_STEP_MINUTES = 30;

const WEEK_LENGTH = 7;
const MONTH_GRID_CELLS = 42;
const BARBERSHOP_OFFSET_MS = -3 * 60 * 60 * 1000;

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  weekday: "long",
});

const monthYearFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const shortWeekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

// Os campos UTC representam a data e a hora locais da barbearia no calendário.
export function getAgendaDate(instant = new Date()) {
  return new Date(instant.getTime() + BARBERSHOP_OFFSET_MS);
}

export function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function addDays(date: Date, amount: number) {
  const next = startOfDay(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1)
  );
}

export function isSameDay(first: Date, second: Date) {
  return (
    first.getUTCFullYear() === second.getUTCFullYear() &&
    first.getUTCMonth() === second.getUTCMonth() &&
    first.getUTCDate() === second.getUTCDate()
  );
}

export function isToday(date: Date) {
  return isSameDay(date, getAgendaDate());
}

export function getWeekDays(date: Date) {
  const start = addDays(date, -date.getUTCDay());

  return Array.from({ length: WEEK_LENGTH }, (_, index) =>
    addDays(start, index)
  );
}

export function getMonthGrid(date: Date) {
  const firstDay = addMonths(date, 0);
  const start = addDays(firstDay, -firstDay.getUTCDay());

  return Array.from({ length: MONTH_GRID_CELLS }, (_, index) =>
    addDays(start, index)
  );
}

export function getAgendaPeriod(date: Date, view: AgendaView) {
  let firstDay = startOfDay(date);
  let lastDay = firstDay;

  if (view === "semana" || view === "mes") {
    const days = view === "semana" ? getWeekDays(date) : getMonthGrid(date);
    [firstDay] = days;
    lastDay = days.at(-1) ?? firstDay;
  }

  return {
    fim: new Date(
      addDays(lastDay, 1).getTime() - BARBERSHOP_OFFSET_MS - 1
    ).toISOString(),
    inicio: new Date(firstDay.getTime() - BARBERSHOP_OFFSET_MS).toISOString(),
  };
}

export function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!(year && month && day)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

export function formatFullDate(date: Date) {
  return fullDateFormatter.format(date);
}

export function formatMonthYear(date: Date) {
  return monthYearFormatter.format(date);
}

export function formatShortWeekday(date: Date) {
  return shortWeekdayFormatter.format(date).replace(".", "");
}

export function formatShortDate(date: Date) {
  return shortDateFormatter.format(date).replace(".", "");
}

export function getTimeSlots(startMinutes: number, endMinutes: number) {
  const slots: number[] = [];

  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += TIME_SLOT_STEP_MINUTES
  ) {
    slots.push(minutes);
  }

  return slots;
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function minutesOfDay(date: Date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}
