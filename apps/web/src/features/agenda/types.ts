export const STATUS_AGENDAMENTO = [
  "agendado",
  "confirmado",
  "em_atendimento",
  "concluido",
  "cancelado",
  "ausente",
] as const;

export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];

export interface Profissional {
  id: string;
  nome: string;
}

export interface Servico {
  id: string;
  nome: string;
}

export interface Agendamento {
  clienteNome: string;
  duracaoMinutos: number;
  id: string;
  inicio: string;
  profissionalId: string;
  servicoId: string;
  status: StatusAgendamento;
}

export interface AgendaFilters {
  profissionalId: string;
  servicoId: string;
  status: StatusAgendamento | "";
}

export type AgendaView = "dia" | "semana" | "mes";
