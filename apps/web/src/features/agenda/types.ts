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

interface ServicoAgendamento extends ReferenciaAgenda {
  preco: number;
}

export interface Agendamento {
  cliente: ReferenciaAgenda | null;
  duracaoMinutos: number;
  id: number;
  inicio: string;
  profissional: ReferenciaAgenda | null;
  servico: ServicoAgendamento | null;
  status: StatusAgendamento;
}

export type TipoHistorico = "cliente" | "profissional";

export interface NovoAgendamentoInput {
  clienteId: number;
  inicio: string;
  profissionalId: number;
  servicoId: number;
}

export interface DiaDisponibilidade {
  data: string;
  horarios: string[];
  status: "disponivel" | "fechado" | "folga" | "lotado";
}

export interface AgendaFilters {
  profissionalId: string;
  servicoId: string;
  status: StatusAgendamento | "";
}

export type AgendaView = "dia" | "semana" | "mes";
