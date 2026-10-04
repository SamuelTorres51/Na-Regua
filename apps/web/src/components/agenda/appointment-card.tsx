import { ClockIcon } from "@/components/ui/icons";
import { formatMinutes, minutesOfDay } from "@/features/agenda/date-utils";
import type { Agendamento } from "@/features/agenda/types";

import { StatusBadge } from "./status-badge";

interface AppointmentCardProps {
  agendamento: Agendamento;
  profissionalNome?: string;
  servicoNome?: string;
}

export function AppointmentCard({
  agendamento,
  profissionalNome,
  servicoNome,
}: AppointmentCardProps) {
  const horario = formatMinutes(minutesOfDay(new Date(agendamento.inicio)));
  const detalhes = [servicoNome, profissionalNome].filter(Boolean).join(" · ");

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 transition-colors hover:border-zinc-700">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-roboto-medium text-xs text-zinc-300">
          <ClockIcon className="h-3.5 w-3.5" />
          {horario}
        </span>
        <StatusBadge status={agendamento.status} />
      </div>

      <p className="mt-2 truncate font-roboto-medium text-sm text-white">
        {agendamento.clienteNome}
      </p>
      <p className="mt-0.5 truncate font-roboto text-xs text-zinc-500">
        {detalhes || "Detalhes não informados"}
      </p>
    </article>
  );
}
