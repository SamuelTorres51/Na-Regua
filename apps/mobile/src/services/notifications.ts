import type { AppNotification, NotificationKind } from "@/types/models";
import { api } from "./api-client";

const KIND_FROM_API: Record<string, NotificationKind> = {
  cancelamento_agendamento: "cancellation",
  confirmacao_agendamento: "confirmation",
  lembrete_agendamento: "reminder",
};

interface NotificationResponse {
  agendamento_id: number | null;
  enviada_em: string;
  id: number;
  lida: boolean;
  mensagem: string;
  tipo: string;
}

interface UnreadCountResponse {
  total_nao_lidas: number;
}

function toNotification({
  agendamento_id: appointmentId,
  enviada_em: sentAt,
  id,
  lida: isRead,
  mensagem: message,
  tipo: kind,
}: NotificationResponse): AppNotification {
  return {
    appointmentId: appointmentId === null ? undefined : String(appointmentId),
    id: String(id),
    isRead,
    kind: KIND_FROM_API[kind] ?? "general",
    message,
    sentAt: new Date(sentAt).toISOString(),
  };
}

export async function listNotifications() {
  const responses = await api.get<NotificationResponse[]>("/notificacoes");

  return responses.map(toNotification);
}

export async function countUnreadNotifications() {
  const { total_nao_lidas: total } = await api.get<UnreadCountResponse>(
    "/notificacoes/nao-lidas/count"
  );

  return total;
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await api.patch<NotificationResponse>(
    `/notificacoes/${notificationId}/ler`
  );

  return toNotification(response);
}
