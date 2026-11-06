import type {
  Appointment,
  Barber,
  BusyPeriod,
  Service,
  TimeRange,
  WeeklyHours,
} from "@/types/models";

const MORNING_HOUR = 10;
const LATE_MORNING_HOUR = 11;
const AFTERNOON_HOUR = 14;
const LATE_AFTERNOON_HOUR = 16;
const HALF_HOUR = 30;
const AGENDA_STEP_MINUTES = 5;
const MS_PER_MINUTE = 60_000;

export const SERVICES: Service[] = [
  {
    category: "hair",
    description: "Degradê na máquina com acabamento na tesoura.",
    durationMinutes: 45,
    id: "svc-corte-degrade",
    name: "Corte degradê",
    priceInCents: 3500,
  },
  {
    category: "hair",
    description: "Corte clássico na tesoura, com acabamento no pezinho.",
    durationMinutes: 40,
    id: "svc-corte-social",
    name: "Corte social",
    priceInCents: 3000,
  },
  {
    category: "hair",
    description: "Lavagem com shampoo e finalização com escova.",
    durationMinutes: 30,
    id: "svc-lavagem-escova",
    name: "Lavagem e escova",
    priceInCents: 2500,
  },
  {
    category: "beard",
    description: "Barba modelada com toalha quente e navalha.",
    durationMinutes: 30,
    id: "svc-barba",
    name: "Barba completa",
    priceInCents: 2500,
  },
  {
    category: "beard",
    description: "Limpeza e alinhamento da sobrancelha na navalha.",
    durationMinutes: 20,
    id: "svc-sobrancelha",
    name: "Sobrancelha masculina",
    priceInCents: 1500,
  },
  {
    category: "manicure",
    description: "Corte, lixa e cutilagem das unhas das mãos.",
    durationMinutes: 45,
    id: "svc-manicure",
    name: "Manicure tradicional",
    priceInCents: 3000,
  },
  {
    category: "manicure",
    description: "Corte, lixa, cutilagem e hidratação dos pés.",
    durationMinutes: 60,
    id: "svc-pedicure",
    name: "Pedicure completa",
    priceInCents: 4000,
  },
  {
    category: "aesthetics",
    description: "Design com pinça e linha, de acordo com o formato do rosto.",
    durationMinutes: 50,
    id: "svc-design-sobrancelha",
    name: "Design de sobrancelha",
    priceInCents: 3500,
  },
  {
    category: "wigs",
    description: "Aplicação e ajuste da peruca ao formato da cabeça.",
    durationMinutes: 90,
    id: "svc-aplicacao-peruca",
    name: "Aplicação de peruca",
    priceInCents: 8000,
  },
  {
    category: "wigs",
    description: "Higienização, hidratação e reajuste da peruca.",
    durationMinutes: 60,
    id: "svc-manutencao-peruca",
    name: "Manutenção de peruca",
    priceInCents: 5500,
  },
];

export const BARBERS: Barber[] = [
  {
    id: "brb-rafael",
    name: "Rafael Costa",
    role: "Barbeiro especialista",
    serviceIds: [
      "svc-corte-degrade",
      "svc-corte-social",
      "svc-barba",
      "svc-sobrancelha",
      "svc-design-sobrancelha",
    ],
    specialities: ["Degradê", "Barba", "Sobrancelha"],
  },
  {
    id: "brb-lucas",
    name: "Lucas Mendes",
    role: "Cabeleireiro",
    serviceIds: [
      "svc-corte-social",
      "svc-lavagem-escova",
      "svc-aplicacao-peruca",
      "svc-manutencao-peruca",
    ],
    specialities: ["Corte social", "Lavagem e escova", "Perucas"],
  },
  {
    id: "brb-bruno",
    name: "Bruno Santos",
    role: "Barbeiro",
    serviceIds: [
      "svc-corte-degrade",
      "svc-barba",
      "svc-manicure",
      "svc-pedicure",
    ],
    specialities: ["Degradê", "Barba", "Manicure e pedicure"],
  },
];

const WEEKDAY_OPENING: TimeRange[] = [{ end: "19:00", start: "09:00" }];
const SATURDAY_OPENING: TimeRange[] = [{ end: "14:00", start: "08:00" }];

export const BUSINESS_HOURS: WeeklyHours = {
  friday: WEEKDAY_OPENING,
  monday: WEEKDAY_OPENING,
  saturday: SATURDAY_OPENING,
  thursday: WEEKDAY_OPENING,
  tuesday: WEEKDAY_OPENING,
  wednesday: WEEKDAY_OPENING,
};

const RAFAEL_SHIFT: TimeRange[] = [
  { end: "12:00", start: "09:00" },
  { end: "19:00", start: "13:00" },
];

const LUCAS_SHIFT: TimeRange[] = [
  { end: "14:00", start: "10:00" },
  { end: "19:00", start: "15:00" },
];

const BRUNO_SHIFT: TimeRange[] = [
  { end: "13:00", start: "09:00" },
  { end: "18:00", start: "14:00" },
];

export const WORKING_HOURS: Record<string, WeeklyHours> = {
  "brb-bruno": {
    friday: BRUNO_SHIFT,
    monday: BRUNO_SHIFT,
    saturday: [{ end: "12:00", start: "08:00" }],
    thursday: BRUNO_SHIFT,
    tuesday: BRUNO_SHIFT,
    wednesday: BRUNO_SHIFT,
  },
  "brb-lucas": {
    friday: LUCAS_SHIFT,
    monday: LUCAS_SHIFT,
    thursday: LUCAS_SHIFT,
    tuesday: LUCAS_SHIFT,
    wednesday: LUCAS_SHIFT,
  },
  "brb-rafael": {
    friday: RAFAEL_SHIFT,
    saturday: SATURDAY_OPENING,
    thursday: RAFAEL_SHIFT,
    tuesday: RAFAEL_SHIFT,
    wednesday: RAFAEL_SHIFT,
  },
};

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
      service: findById(SERVICES, "svc-corte-degrade"),
      startsAt: atDaysFromNow(2, AFTERNOON_HOUR, HALF_HOUR),
      status: "confirmed",
    },
    {
      barber: findById(BARBERS, "brb-bruno"),
      id: "apt-2",
      service: findById(SERVICES, "svc-barba"),
      startsAt: atDaysFromNow(6, MORNING_HOUR),
      status: "scheduled",
    },
    {
      barber: findById(BARBERS, "brb-lucas"),
      id: "apt-3",
      service: findById(SERVICES, "svc-corte-social"),
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
      barber: findById(BARBERS, "brb-bruno"),
      id: "apt-5",
      service: findById(SERVICES, "svc-manicure"),
      startsAt: atDaysFromNow(-20, MORNING_HOUR, HALF_HOUR),
      status: "completed",
    },
    // Exemplos de "em atendimento", de cancelamento fora do prazo mínimo e de
    // ausência, para a tela mostrar todos os status do RF36 e a regra do RF34.
    {
      barber: findById(BARBERS, "brb-bruno"),
      id: "apt-6",
      service: findById(SERVICES, "svc-corte-degrade"),
      startsAt: atMinutesFromNow(-10),
      status: "inProgress",
    },
    {
      barber: findById(BARBERS, "brb-rafael"),
      id: "apt-7",
      service: findById(SERVICES, "svc-barba"),
      startsAt: atMinutesFromNow(40),
      status: "confirmed",
    },
    {
      barber: findById(BARBERS, "brb-lucas"),
      id: "apt-8",
      service: findById(SERVICES, "svc-lavagem-escova"),
      startsAt: atDaysFromNow(-26, AFTERNOON_HOUR),
      status: "noShow",
    },
  ];
}

export function createMockClosedDates() {
  return [atDaysFromNow(5, 0)];
}

export function createMockBusyPeriods(): BusyPeriod[] {
  return [
    {
      barberId: "brb-rafael",
      endsAt: atDaysFromNow(1, 10, HALF_HOUR),
      startsAt: atDaysFromNow(1, 9),
    },
    {
      barberId: "brb-rafael",
      endsAt: atDaysFromNow(1, 16),
      startsAt: atDaysFromNow(1, AFTERNOON_HOUR, HALF_HOUR),
    },
    {
      barberId: "brb-lucas",
      endsAt: atDaysFromNow(1, 12),
      startsAt: atDaysFromNow(1, MORNING_HOUR),
    },
    {
      barberId: "brb-bruno",
      endsAt: atDaysFromNow(1, LATE_MORNING_HOUR),
      startsAt: atDaysFromNow(1, 9, HALF_HOUR),
    },
    {
      barberId: "brb-bruno",
      endsAt: atDaysFromNow(3, 0),
      startsAt: atDaysFromNow(2, 0),
    },
  ];
}
