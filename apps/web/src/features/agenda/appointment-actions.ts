import type { Usuario } from "@/features/auth/types";
import type { Agendamento, StatusAgendamento } from "./types";

export type StatusAtualizavel =
  | "ausente"
  | "concluido"
  | "confirmado"
  | "em_atendimento";

const STATUS_TRANSITIONS: Record<
  StatusAgendamento,
  readonly StatusAtualizavel[]
> = {
  agendado: ["confirmado", "ausente"],
  ausente: [],
  cancelado: [],
  concluido: [],
  confirmado: ["em_atendimento", "ausente"],
  em_atendimento: ["concluido"],
};

const STATUS_ACTION_LABELS: Record<StatusAtualizavel, string> = {
  ausente: "Registrar ausência",
  concluido: "Concluir atendimento",
  confirmado: "Confirmar agendamento",
  em_atendimento: "Iniciar atendimento",
};

const MIN_CANCEL_NOTICE_MS = 60 * 60 * 1000;
export const MAX_REASON_LENGTH = 500;

export const CANCELLATION_DEADLINE_MESSAGE =
  "O cancelamento exige pelo menos 60 minutos de antecedência.";

export function podeGerenciarAgendamento(
  agendamento: Agendamento,
  usuario: Pick<Usuario, "id" | "perfil"> | undefined
) {
  return (
    STATUS_TRANSITIONS[agendamento.status].length > 0 &&
    (usuario?.perfil === "administrador" ||
      (usuario?.perfil === "profissional" &&
        agendamento.profissional?.id === usuario.id))
  );
}

export function temStatusCancelavel(status: StatusAgendamento) {
  return status === "agendado" || status === "confirmado";
}

export function podeCancelarAgendamento(
  agendamento: Agendamento,
  now = Date.now()
) {
  return (
    temStatusCancelavel(agendamento.status) &&
    Date.parse(agendamento.inicio) - now >= MIN_CANCEL_NOTICE_MS
  );
}

export function listarAcoesDeStatus(status: StatusAgendamento) {
  return STATUS_TRANSITIONS[status].map((value) => ({
    label: STATUS_ACTION_LABELS[value],
    value,
  }));
}

export function validarMotivoCancelamento(motivo: string) {
  const { length } = Array.from(motivo.trim());
  if (length === 0) {
    return "Informe o motivo do cancelamento.";
  }
  if (length > MAX_REASON_LENGTH) {
    return `O motivo deve ter até ${MAX_REASON_LENGTH} caracteres.`;
  }
  return null;
}
