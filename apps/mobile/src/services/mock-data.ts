import type { Appointment, Barber, Service } from "@/types/models";

const MORNING_HOUR = 10;
const LATE_MORNING_HOUR = 11;
const AFTERNOON_HOUR = 14;
const LATE_AFTERNOON_HOUR = 16;
const HALF_HOUR = 30;
const AGENDA_STEP_MINUTES = 5;
const MS_PER_MINUTE = 60_000;

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
  {
    description: "Design de sobrancelha na navalha.",
    durationMinutes: 15,
    id: "svc-sobrancelha",
    name: "Sobrancelha",
    priceInCents: 1500,
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
    serviceIds: ["svc-hidratacao"],
    specialities: ["Hidrata e Trata"],
  },
  {
    id: "brb-rafael",
    name: "Rafael Costa",
    serviceIds: ["svc-corte", "svc-sobrancelha"],
    specialities: ["Degradê", "Sobrancelha"],
  },
  {
    id: "brb-diego",
    name: "Diego Almeida",
    serviceIds: ["svc-barba", "svc-hidratacao"],
    specialities: ["Barba", "Hidratação"],
  },
  {
    id: "brb-lucas",
    name: "Lucas Ferreira",
    serviceIds: ["svc-corte"],
    specialities: ["Corte social"],
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

// Arredonda para a grade de 5 em 5 minutos, como numa agenda real.
function atMinutesFromNow(minutes: number) {
  const date = new Date(Date.now() + minutes * MS_PER_MINUTE);
  const roundedMinutes =
    Math.round(date.getMinutes() / AGENDA_STEP_MINUTES) * AGENDA_STEP_MINUTES;
  date.setMinutes(roundedMinutes, 0, 0);
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
    // Exemplos de "em atendimento", de cancelamento fora do prazo mínimo e de
    // ausência, para a tela mostrar todos os status do RF36 e a regra do RF34.
    {
      barber: findById(BARBERS, "brb-samuel"),
      id: "apt-6",
      service: findById(SERVICES, "svc-corte"),
      startsAt: atMinutesFromNow(-10),
      status: "inProgress",
    },
    {
      barber: findById(BARBERS, "brb-samuel"),
      id: "apt-7",
      service: findById(SERVICES, "svc-barba"),
      startsAt: atMinutesFromNow(40),
      status: "confirmed",
    },
    {
      barber: findById(BARBERS, "brb-luciano"),
      id: "apt-8",
      service: findById(SERVICES, "svc-hidratacao"),
      startsAt: atDaysFromNow(-26, AFTERNOON_HOUR),
      status: "noShow",
    },
  ];
}
