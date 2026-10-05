const CENTS_PER_UNIT = 100;
const MINUTES_PER_HOUR = 60;
const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 18;
const MS_PER_DAY = 86_400_000;

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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

// "Hoje", "Amanhã" e "Ontem" no lugar da data; o resto cai em formatDate.
// O arredondamento absorve dias de 23 ou 25 horas no horário de verão.
export function formatRelativeDate(isoDate: string, now = new Date()) {
  const dayDifference = Math.round(
    (startOfDay(new Date(isoDate)) - startOfDay(now)) / MS_PER_DAY
  );

  switch (dayDifference) {
    case -1:
      return "Ontem";
    case 0:
      return "Hoje";
    case 1:
      return "Amanhã";
    default:
      return capitalize(formatDate(isoDate));
  }
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
