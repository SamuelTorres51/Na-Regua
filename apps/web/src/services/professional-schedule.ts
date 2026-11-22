import type { Turno } from "@/features/business-hours/schedule";
import { api } from "./api-client";

interface JornadaProfissional {
  personalizada: boolean;
  profissionalId: number;
  turnos: Turno[] | null;
}

function jornadaPath(profissionalId: number) {
  return `/profissionais/${profissionalId}/jornada`;
}

export function getProfessionalSchedule(profissionalId: number) {
  return api.get<JornadaProfissional>(jornadaPath(profissionalId));
}

export function updateProfessionalSchedule(
  profissionalId: number,
  turnos: Turno[] | null
) {
  return api.put<JornadaProfissional>(jornadaPath(profissionalId), { turnos });
}
