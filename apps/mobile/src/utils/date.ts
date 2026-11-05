export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isValidDate(isoDate?: string): isoDate is string {
  return isoDate !== undefined && !Number.isNaN(Date.parse(isoDate));
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
