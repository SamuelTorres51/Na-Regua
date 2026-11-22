import type { Turno } from "@/features/business-hours/schedule";
import { api, isApiEnabled } from "./api-client";
import { simulateLatency } from "./fake-api";

interface JornadaProfissional {
  personalizada: boolean;
  profissionalId: number;
  turnos: Turno[] | null;
}

const mockJornadas = new Map<number, Turno[]>();

function jornadaPath(profissionalId: number) {
  return `/profissionais/${profissionalId}/jornada`;
}

function readMockJornada(profissionalId: number): JornadaProfissional {
  const turnos = mockJornadas.get(profissionalId) ?? null;
  return { personalizada: turnos !== null, profissionalId, turnos };
}

export async function getProfessionalSchedule(profissionalId: number) {
  if (isApiEnabled) {
    return api.get<JornadaProfissional>(jornadaPath(profissionalId));
  }

  await simulateLatency();
  return readMockJornada(profissionalId);
}

export async function updateProfessionalSchedule(
  profissionalId: number,
  turnos: Turno[] | null
) {
  if (isApiEnabled) {
    return api.put<JornadaProfissional>(jornadaPath(profissionalId), {
      turnos,
    });
  }

  await simulateLatency();
  if (turnos === null) {
    mockJornadas.delete(profissionalId);
  } else {
    mockJornadas.set(profissionalId, turnos);
  }
  return readMockJornada(profissionalId);
}
