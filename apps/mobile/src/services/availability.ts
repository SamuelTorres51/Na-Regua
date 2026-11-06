import type {
  Appointment,
  AppointmentStatus,
  Barber,
  BookingDay,
  BookingSelectionIds,
  BusyPeriod,
  Service,
  TimeRange,
  Weekday,
  WeeklyHours,
} from "@/types/models";
import { addDays, isValidDate, startOfDay } from "@/utils/date";
import { getBarberAppointments } from "./appointments";
import { simulateLatency } from "./fake-api";
import {
  BARBERS,
  BUSINESS_HOURS,
  createMockBusyPeriods,
  createMockClosedDates,
  SERVICES,
  WORKING_HOURS,
} from "./mock-data";

const MAX_BOOKING_DAYS_AHEAD = 15;
const MIN_BOOKING_NOTICE_MINUTES = 30;
const SLOT_INTERVAL_MINUTES = 30;
const MS_PER_MINUTE = 60_000;

const WEEKDAYS: readonly Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const BLOCKING_STATUSES: readonly AppointmentStatus[] = [
  "confirmed",
  "inProgress",
  "scheduled",
];

const busyPeriods = createMockBusyPeriods();

const closedDays = new Set(
  createMockClosedDates().map((date) => startOfDay(new Date(date)).getTime())
);

interface Period {
  end: number;
  start: number;
}

interface BarberSchedule {
  busyPeriods: Period[];
  durationMs: number;
  earliestStart: number;
  workingHours: WeeklyHours;
}

function atTime(day: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours,
    minutes
  ).getTime();
}

function toPeriods(day: Date, ranges: TimeRange[] = []): Period[] {
  return ranges.map((range) => ({
    end: atTime(day, range.end),
    start: atTime(day, range.start),
  }));
}

function intersectPeriods(firstPeriods: Period[], secondPeriods: Period[]) {
  return firstPeriods
    .flatMap((first) =>
      secondPeriods.map((second) => ({
        end: Math.min(first.end, second.end),
        start: Math.max(first.start, second.start),
      }))
    )
    .filter((period) => period.start < period.end);
}

function overlaps(first: Period, second: Period) {
  return first.start < second.end && second.start < first.end;
}

function listPeriodSlots({ end, start }: Period, durationMs: number) {
  const slots: Period[] = [];
  const intervalMs = SLOT_INTERVAL_MINUTES * MS_PER_MINUTE;

  for (
    let slotStart = start;
    slotStart + durationMs <= end;
    slotStart += intervalMs
  ) {
    slots.push({ end: slotStart + durationMs, start: slotStart });
  }

  return slots;
}

function isBookable(slot: Period, schedule: BarberSchedule) {
  return (
    slot.start >= schedule.earliestStart &&
    !schedule.busyPeriods.some((period) => overlaps(slot, period))
  );
}

function buildBookingDay(day: Date, schedule: BarberSchedule): BookingDay {
  const date = day.toISOString();
  const weekday = WEEKDAYS[day.getDay()];
  const openingPeriods = toPeriods(day, BUSINESS_HOURS[weekday]);

  if (openingPeriods.length === 0 || closedDays.has(day.getTime())) {
    return { date, slots: [], status: "closed" };
  }

  const workingPeriods = intersectPeriods(
    openingPeriods,
    toPeriods(day, schedule.workingHours[weekday])
  );

  if (workingPeriods.length === 0) {
    return { date, slots: [], status: "dayOff" };
  }

  const slots = workingPeriods
    .flatMap((period) => listPeriodSlots(period, schedule.durationMs))
    .filter((slot) => isBookable(slot, schedule))
    .map((slot) => new Date(slot.start).toISOString());

  return { date, slots, status: slots.length > 0 ? "available" : "full" };
}

function toSlotPeriod(startsAt: string, durationMinutes: number): Period {
  const start = Date.parse(startsAt);

  return { end: start + durationMinutes * MS_PER_MINUTE, start };
}

function toAppointmentPeriod({ service, startsAt }: Appointment) {
  return toSlotPeriod(startsAt, service.durationMinutes);
}

function toBusyPeriod({ endsAt, startsAt }: BusyPeriod): Period {
  return { end: Date.parse(endsAt), start: Date.parse(startsAt) };
}

function listActivePeriods(appointments: Appointment[]) {
  return appointments
    .filter((appointment) => BLOCKING_STATUSES.includes(appointment.status))
    .map(toAppointmentPeriod);
}

function getBarberBusyPeriods(barberId: string) {
  const blockedPeriods = busyPeriods
    .filter((period) => period.barberId === barberId)
    .map(toBusyPeriod);

  return [
    ...listActivePeriods(getBarberAppointments(barberId)),
    ...blockedPeriods,
  ];
}

function createSchedule(
  barber: Barber,
  service: Service,
  now: Date
): BarberSchedule {
  return {
    busyPeriods: getBarberBusyPeriods(barber.id),
    durationMs: service.durationMinutes * MS_PER_MINUTE,
    earliestStart: now.getTime() + MIN_BOOKING_NOTICE_MINUTES * MS_PER_MINUTE,
    workingHours: WORKING_HOURS[barber.id] ?? {},
  };
}

function isWithinBookingWindow(day: Date, today: Date) {
  const lastDay = addDays(today, MAX_BOOKING_DAYS_AHEAD);
  const time = day.getTime();

  return time >= today.getTime() && time <= lastDay.getTime();
}

export function isSlotAvailable(
  barber: Barber,
  service: Service,
  startsAt: string
) {
  if (!(isValidDate(startsAt) && barber.serviceIds.includes(service.id))) {
    return false;
  }

  const now = new Date();
  const day = startOfDay(new Date(startsAt));

  if (!isWithinBookingWindow(day, startOfDay(now))) {
    return false;
  }

  const schedule = createSchedule(barber, service, now);
  const slot = new Date(startsAt).toISOString();

  return buildBookingDay(day, schedule).slots.includes(slot);
}

export function hasAppointmentAt(
  appointments: Appointment[],
  startsAt: string,
  durationMinutes: number
) {
  const slot = toSlotPeriod(startsAt, durationMinutes);

  return listActivePeriods(appointments).some((period) =>
    overlaps(slot, period)
  );
}

export async function listBookingDays({
  barberId,
  serviceId,
}: BookingSelectionIds): Promise<BookingDay[]> {
  await simulateLatency();

  const barber = BARBERS.find((current) => current.id === barberId);
  const service = SERVICES.find((current) => current.id === serviceId);

  if (!(barber && service && barber.serviceIds.includes(service.id))) {
    return [];
  }

  const now = new Date();
  const today = startOfDay(now);
  const schedule = createSchedule(barber, service, now);

  return Array.from({ length: MAX_BOOKING_DAYS_AHEAD + 1 }, (_, index) =>
    buildBookingDay(addDays(today, index), schedule)
  );
}
