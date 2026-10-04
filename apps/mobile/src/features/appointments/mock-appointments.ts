import { addDays, addMinutes, roundToNearestMinutes, set } from "date-fns";
import type { Appointment } from "./types";

const AGENDA_STEP_MINUTES = 5;

function atDay(daysFromNow: number, hours: number, minutes: number) {
  return set(addDays(new Date(), daysFromNow), {
    hours,
    milliseconds: 0,
    minutes,
    seconds: 0,
  }).toISOString();
}

function inMinutes(minutesFromNow: number) {
  return roundToNearestMinutes(addMinutes(new Date(), minutesFromNow), {
    nearestTo: AGENDA_STEP_MINUTES,
  }).toISOString();
}

// PROVISÓRIO: dados estáticos até a API existir. As datas são relativas ao
// momento em que a lista carrega, para sempre haver itens nas duas abas e
// um exemplo de cada status (RF36) e de cada situação de cancelamento.
export function createMockAppointments(): Appointment[] {
  return [
    {
      barberName: "Bruno Lima",
      durationInMinutes: 50,
      id: "1",
      priceInCents: 5500,
      scheduledAt: inMinutes(-10),
      serviceName: "Corte + barba",
      status: "inProgress",
    },
    {
      barberName: "Diego Almeida",
      durationInMinutes: 20,
      id: "2",
      priceInCents: 2500,
      scheduledAt: inMinutes(40),
      serviceName: "Barba",
      status: "confirmed",
    },
    {
      barberName: "Rafael Costa",
      durationInMinutes: 30,
      id: "3",
      priceInCents: 3500,
      scheduledAt: atDay(1, 14, 30),
      serviceName: "Corte masculino",
      status: "confirmed",
    },
    {
      barberName: "Diego Almeida",
      durationInMinutes: 15,
      id: "4",
      priceInCents: 1500,
      scheduledAt: atDay(6, 10, 0),
      serviceName: "Sobrancelha",
      status: "scheduled",
    },
    {
      barberName: "Rafael Costa",
      durationInMinutes: 30,
      id: "5",
      priceInCents: 3500,
      scheduledAt: atDay(-5, 16, 0),
      serviceName: "Corte masculino",
      status: "completed",
    },
    {
      barberName: "Diego Almeida",
      durationInMinutes: 30,
      id: "6",
      priceInCents: 3000,
      scheduledAt: atDay(-12, 11, 30),
      serviceName: "Corte infantil",
      status: "cancelled",
    },
    {
      barberName: "Bruno Lima",
      durationInMinutes: 20,
      id: "7",
      priceInCents: 2500,
      scheduledAt: atDay(-20, 15, 0),
      serviceName: "Barba",
      status: "missed",
    },
    {
      barberName: "Rafael Costa",
      durationInMinutes: 50,
      id: "8",
      priceInCents: 5500,
      scheduledAt: atDay(-34, 9, 30),
      serviceName: "Corte + barba",
      status: "completed",
    },
  ];
}
