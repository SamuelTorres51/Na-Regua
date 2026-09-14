import type { Appointment, Barber, Service } from "@/types/models";

const MORNING_HOUR = 10;
const LATE_MORNING_HOUR = 11;
const AFTERNOON_HOUR = 14;
const LATE_AFTERNOON_HOUR = 16;
const HALF_HOUR = 30;

export const SERVICES: Service[] = [
  {
    description: "Corte na tesoura ou na máquina, com pezinho.",
    durationMinutes: 30,
    id: "svc-corte",
    name: "Corte completo",
    priceInCents: 4000,
  },
  {
    description: "Barba modelada com toalha quente e navalha",
    durationMinutes: 30,
    id: "svc-barba",
    name: "Barba completa",
    priceInCents: 3000,
  },
  {
    description: "Hidratação capilar para cabelo e barba",
    durationMinutes: 30,
    id: "svc-hidratacao",
    name: "Hidratação",
    priceInCents: 3500,
  },
];

export const BARBERS: Barber[] = [
  {
    id: "brb-samuel",
    name: "Samuel de Arrascaeta",
    serviceIds: ["svc-corte", "svc-barba"],
    specialities: ["Degradê", "Cabelo na régua", "Barba"],
  },
  {
    id: "brb-luciano",
    name: "Lionel Luciano",
    serviceIds: ["sv-hidratacao"],
    specialities: ["Hidrata e Trata"],
  },
];

function findById<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((current) => current.id === id);

  if (!item) {
    throw new Error(`Item não encontrado: ${id}`);
  }

  return item;
}

function atDaysFromNow(days: number, hours: number, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export function createMockAppointments(): Appointment[] {
  return [
    {
      barber: findById(BARBERS, "brb-rafael"),
      id: "apt-1",
      service: findById(SERVICES, "svc-corte"),
      startsAt: atDaysFromNow(2, AFTERNOON_HOUR, HALF_HOUR),
      status: "confirmed",
    },
    {
      barber: findById(BARBERS, "brb-diego"),
      id: "apt-2",
      service: findById(SERVICES, "svc-barba"),
      startsAt: atDaysFromNow(6, MORNING_HOUR),
      status: "scheduled",
    },
    {
      barber: findById(BARBERS, "brb-lucas"),
      id: "apt-3",
      service: findById(SERVICES, "svc-corte"),
      startsAt: atDaysFromNow(-5, LATE_AFTERNOON_HOUR),
      status: "completed",
    },
    {
      barber: findById(BARBERS, "brb-rafael"),
      cancelledAt: atDaysFromNow(-13, AFTERNOON_HOUR),
      id: "apt-4",
      service: findById(SERVICES, "svc-sobrancelha"),
      startsAt: atDaysFromNow(-12, LATE_MORNING_HOUR),
      status: "cancelled",
    },
    {
      barber: findById(BARBERS, "brb-diego"),
      id: "apt-5",
      service: findById(SERVICES, "svc-hidratacao"),
      startsAt: atDaysFromNow(-20, MORNING_HOUR, HALF_HOUR),
      status: "completed",
    },
  ];
}
