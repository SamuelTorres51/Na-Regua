const CENTS_PER_UNIT = 100;
const MINUTES_PER_HOUR = 60;
const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 18;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatPrice(priceInCents: number) {
  return currencyFormatter.format(priceInCents / CENTS_PER_UNIT);
}

export function formatDuration(totalMinutes: number) {
  if (totalMinutes < MINUTES_PER_HOUR) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  return minutes > 0 ? `${hours}h${minutes}` : `${hours}h`;
}

export function formatDate(isoDate: string) {
  return dateFormatter.format(new Date(isoDate));
}

export function formatTime(isoDate: string) {
  return timeFormatter.format(new Date(isoDate));
}

export function getFirstName(fullName: string) {
  return fullName.trim().split(" ")[0] ?? "";
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < AFTERNOON_START_HOUR) {
    return "Bom dia";
  }

  if (hour < EVENING_START_HOUR) {
    return "Boa tarde";
  }

  return "Boa noite";
}
