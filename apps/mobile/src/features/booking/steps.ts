export const BOOKING_STEPS = [
  "service",
  "barber",
  "schedule",
  "confirmation",
] as const;

export type BookingStep = (typeof BOOKING_STEPS)[number];

export const RESCHEDULE_STEPS: readonly BookingStep[] = [
  "schedule",
  "confirmation",
];

export const BOOKING_STEP_LABELS: Record<BookingStep, string> = {
  barber: "Profissional",
  confirmation: "Confirmação",
  schedule: "Data e horário",
  service: "Serviço",
};

export const BOOKING_SELECT_HINT = "Avança para o próximo passo do agendamento";
