import type { StatusAtualizavel } from "@/features/agenda/appointment-actions";
import type {
  AgendaFilters,
  Agendamento,
  DiaDisponibilidade,
  NovoAgendamentoInput,
  TipoHistorico,
} from "@/features/agenda/types";
import type { Profissional } from "@/features/professionals/types";
import { api, isApiEnabled } from "./api-client";

export interface AgendaQuery
  extends Partial<Pick<AgendaFilters, "profissionalId" | "status">> {
  clienteId?: number;
  fim?: string;
  inicio?: string;
}

export function listarAgendamentos({
  clienteId,
  fim,
  inicio,
  profissionalId,
  status,
}: AgendaQuery): Promise<Agendamento[]> {
  if (!isApiEnabled) {
    return Promise.resolve([]);
  }

  return api.get<Agendamento[]>("/agendamentos", {
    query: {
      cliente_id: clienteId,
      fim,
      inicio,
      profissional_id: profissionalId,
      status,
    },
  });
}

export async function listarHistoricoAtendimentos(
  tipo: TipoHistorico,
  id: number
) {
  const filtro =
    tipo === "cliente" ? { clienteId: id } : { profissionalId: String(id) };
  const agendamentos = await listarAgendamentos({
    ...filtro,
    status: "concluido",
  });

  return [...agendamentos].sort(
    (first, second) => Date.parse(second.inicio) - Date.parse(first.inicio)
  );
}

export function criarAgendamento(input: NovoAgendamentoInput) {
  return api.post<Agendamento>("/agendamentos", input);
}

export function atualizarStatusAgendamento(
  agendamentoId: number,
  status: StatusAtualizavel
) {
  return api.patch<Agendamento>(`/agendamentos/${agendamentoId}/status`, {
    status,
  });
}

export async function cancelarAgendamento(
  agendamentoId: number,
  motivo: string
) {
  await api.post(`/agendamentos/${agendamentoId}/cancelar`, { motivo });
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
