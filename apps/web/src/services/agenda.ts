import type {
  AgendaFilters,
  Agendamento,
  DiaDisponibilidade,
  NovoAgendamentoInput,
} from "@/features/agenda/types";
import type { Profissional } from "@/features/professionals/types";
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

export function criarAgendamento(input: NovoAgendamentoInput) {
  return api.post<Agendamento>("/agendamentos", input);
}

export async function listarProfissionaisDoServico(servicoId: number) {
  const profissionais = await api.get<Profissional[]>(
    `/servicos/${servicoId}/profissionais`
  );

  return profissionais.filter(({ ativo }) => ativo);
}

export function consultarDisponibilidade(
  profissionalId: number,
  servicoId: number
) {
  return api.get<DiaDisponibilidade[]>(
    `/profissionais/${profissionalId}/disponibilidade`,
    { query: { servico_id: servicoId } }
  );
}
