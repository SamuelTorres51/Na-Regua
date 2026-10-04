import { format, isSameYear, isToday, isTomorrow, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

const DATE_PATTERN = "EEEEEE, d 'de' MMM";
const DATE_WITH_YEAR_PATTERN = "d 'de' MMM 'de' yyyy";
const TIME_PATTERN = "HH:mm";
const MINUTES_IN_HOUR = 60;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatAppointmentDate(isoDate: string) {
  const date = new Date(isoDate);

  if (isToday(date)) {
    return "Hoje";
  }

  if (isTomorrow(date)) {
    return "Amanhã";
  }

  if (isYesterday(date)) {
    return "Ontem";
  }

  const pattern = isSameYear(date, new Date())
    ? DATE_PATTERN
    : DATE_WITH_YEAR_PATTERN;

  return capitalize(format(date, pattern, { locale: ptBR }));
}

export function formatAppointmentTime(isoDate: string) {
  return format(new Date(isoDate), TIME_PATTERN);
}

export function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
  const minutes = totalMinutes % MINUTES_IN_HOUR;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}
