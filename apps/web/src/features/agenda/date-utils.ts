export const TIME_SLOT_START_MINUTES = 8 * 60;
export const TIME_SLOT_END_MINUTES = 20 * 60;
export const TIME_SLOT_STEP_MINUTES = 30;

const WEEK_LENGTH = 7;
const MONTH_GRID_CELLS = 42;

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  weekday: "long",
});

const monthYearFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const shortWeekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}

export function getWeekDays(date: Date) {
  const start = addDays(date, -date.getDay());

  return Array.from({ length: WEEK_LENGTH }, (_, index) =>
    addDays(start, index)
  );
}

export function getMonthGrid(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: MONTH_GRID_CELLS }, (_, index) =>
    addDays(start, index)
  );
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!(year && month && day)) {
    return null;
  }

  return new Date(year, month - 1, day);
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

export function getTimeSlots() {
  const slots: number[] = [];

  for (
    let minutes = TIME_SLOT_START_MINUTES;
    minutes < TIME_SLOT_END_MINUTES;
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
  return date.getHours() * 60 + date.getMinutes();
}
