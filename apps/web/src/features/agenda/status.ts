import type { StatusAgendamento } from "./types";

export const STATUS_LABELS: Record<StatusAgendamento, string> = {
  agendado: "Agendado",
  ausente: "Ausente",
  cancelado: "Cancelado",
  concluido: "Concluído",
  confirmado: "Confirmado",
  em_atendimento: "Em atendimento",
};

export const STATUS_BADGE_CLASSES: Record<StatusAgendamento, string> = {
  agendado: "border-zinc-600 bg-zinc-700/30 text-zinc-300",
  ausente: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  cancelado: "border-danger/40 bg-danger/10 text-danger",
  concluido: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  confirmado: "border-brand/40 bg-brand/10 text-brand",
  em_atendimento: "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

export const STATUS_DOT_CLASSES: Record<StatusAgendamento, string> = {
  agendado: "bg-zinc-500",
  ausente: "bg-orange-400",
  cancelado: "bg-danger",
  concluido: "bg-emerald-400",
  confirmado: "bg-brand",
  em_atendimento: "bg-sky-400",
};
