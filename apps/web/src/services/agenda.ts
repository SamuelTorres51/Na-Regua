import type { AgendaFilters, Agendamento } from "@/features/agenda/types";
import { api, isApiEnabled } from "./api-client";

export interface AgendaQuery
  extends Pick<AgendaFilters, "profissionalId" | "status"> {
  fim: string;
  inicio: string;
}

export function listarAgendamentos({
  fim,
  inicio,
  profissionalId,
  status,
}: AgendaQuery): Promise<Agendamento[]> {
  if (!isApiEnabled) {
    return Promise.resolve([]);
  }

  return api.get<Agendamento[]>("/agendamentos", {
    query: { fim, inicio, profissional_id: profissionalId, status },
  });
}
