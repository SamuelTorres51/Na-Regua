import type { Turno } from "@/features/business-hours/schedule";
import { api } from "./api-client";

interface HorarioFuncionamento {
  turnos: Turno[];
}

const HORARIOS_PATH = "/barbearia/horarios";

export function getBusinessHours() {
  return api.get<HorarioFuncionamento>(HORARIOS_PATH);
}

export function updateBusinessHours(turnos: Turno[]) {
  return api.put<HorarioFuncionamento>(HORARIOS_PATH, { turnos });
}
