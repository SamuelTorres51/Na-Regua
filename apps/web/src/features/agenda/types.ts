export const STATUS_AGENDAMENTO = [
  "agendado",
  "confirmado",
  "em_atendimento",
  "concluido",
  "cancelado",
  "ausente",
] as const;

export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];

export interface ReferenciaAgenda {
  id: number;
  nome: string;
}

export interface Agendamento {
  cliente: ReferenciaAgenda | null;
  duracaoMinutos: number;
  id: number;
  inicio: string;
  profissional: ReferenciaAgenda | null;
  servico: ReferenciaAgenda | null;
  status: StatusAgendamento;
}

export interface AgendaFilters {
  profissionalId: string;
  servicoId: string;
  status: StatusAgendamento | "";
}

export type AgendaView = "dia" | "semana" | "mes";
