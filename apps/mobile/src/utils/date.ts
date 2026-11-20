export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isValidDate(isoDate?: string): isoDate is string {
  return isoDate !== undefined && !Number.isNaN(Date.parse(isoDate));
}

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
