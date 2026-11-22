import { DIAS_SEMANA, type Turno } from "@/features/business-hours/schedule";
import { api, isApiEnabled } from "./api-client";
import { simulateLatency } from "./fake-api";

interface HorarioFuncionamento {
  turnos: Turno[];
}

const HORARIOS_PATH = "/barbearia/horarios";

// Reproduz o expediente inicial da API no modo de demonstração.
let mockHorario: HorarioFuncionamento = {
  turnos: DIAS_SEMANA.filter((dia) => dia !== "domingo").flatMap(
    (diaSemana) => [
      { diaSemana, fim: "12:00", inicio: "08:00" },
      { diaSemana, fim: "18:00", inicio: "14:00" },
    ]
  ),
};

export async function getBusinessHours() {
  if (isApiEnabled) {
    return api.get<HorarioFuncionamento>(HORARIOS_PATH);
  }

  await simulateLatency();
  return mockHorario;
}

export async function updateBusinessHours(turnos: Turno[]) {
  if (isApiEnabled) {
    return api.put<HorarioFuncionamento>(HORARIOS_PATH, { turnos });
  }

  await simulateLatency();
  mockHorario = { turnos };
  return mockHorario;
}
