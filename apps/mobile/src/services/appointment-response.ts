import type { Appointment, AppointmentStatus } from "@/types/models";
import { toPriceInCents } from "@/utils/format";

const UNKNOWN_BARBER_NAME = "Profissional";
const UNKNOWN_SERVICE_NAME = "Serviço";

const STATUS_FROM_API: Record<string, AppointmentStatus> = {
  agendado: "scheduled",
  ausente: "noShow",
  cancelado: "cancelled",
  concluido: "completed",
  confirmado: "confirmed",
  em_atendimento: "inProgress",
};

interface AppointmentPersonResponse {
  id: number;
  nome: string;
}

interface AppointmentServiceResponse {
  id: number;
  nome: string;
  preco: number;
}

export interface AppointmentResponse {
  duracaoMinutos: number;
  id: number;
  inicio: string;
  profissional: AppointmentPersonResponse | null;
  servico: AppointmentServiceResponse | null;
  status: string;
}

export function toAppointment({
  duracaoMinutos,
  id,
  inicio,
  profissional,
  servico,
  status,
}: AppointmentResponse): Appointment {
  return {
    barber: {
      id: String(profissional?.id ?? ""),
      name: profissional?.nome ?? UNKNOWN_BARBER_NAME,
    },
    id: String(id),
    service: {
      description: "",
      durationMinutes: duracaoMinutos,
      id: String(servico?.id ?? ""),
      name: servico?.nome ?? UNKNOWN_SERVICE_NAME,
      priceInCents: toPriceInCents(servico?.preco ?? 0),
    },
    startsAt: new Date(inicio).toISOString(),
    status: STATUS_FROM_API[status] ?? "scheduled",
  };
}
