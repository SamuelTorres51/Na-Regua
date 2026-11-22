import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { CalendarIcon } from "@/components/ui/icons";
import { LoadingPanel } from "@/components/ui/state-panels";
import {
  formatMinutes,
  getAgendaDate,
  minutesOfDay,
} from "@/features/agenda/date-utils";
import type {
  Agendamento,
  ReferenciaAgenda,
  TipoHistorico,
} from "@/features/agenda/types";
import { listarHistoricoAtendimentos } from "@/services/agenda";
import { getApiErrorMessage } from "@/services/api-client";
import { formatCurrency } from "@/utils/currency";

const LOAD_ERROR_MESSAGE =
  "Não foi possível carregar o histórico de atendimentos.";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
  year: "numeric",
});

interface HistoryEntryProps {
  agendamento: Agendamento;
  tipo: TipoHistorico;
}

function HistoryEntry({ agendamento, tipo }: HistoryEntryProps) {
  const { cliente, inicio, profissional, servico } = agendamento;
  const date = getAgendaDate(new Date(inicio));
  const dateLabel = `${dateFormatter.format(date)} às ${formatMinutes(minutesOfDay(date))}`;
  const counterpart =
    tipo === "cliente"
      ? (profissional?.nome ?? "Profissional não identificado")
      : (cliente?.nome ?? "Cliente não identificado");

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <CalendarIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-roboto-medium text-sm text-white [overflow-wrap:anywhere]">
            {servico?.nome ?? "Serviço não identificado"}
          </p>
          <p className="mt-1 font-roboto text-xs text-zinc-400 [overflow-wrap:anywhere]">
            <time dateTime={inicio}>{dateLabel}</time> · {counterpart}
          </p>
        </div>
      </div>
      {servico ? (
        <div className="whitespace-nowrap text-right">
          <p className="font-roboto-medium text-sm text-zinc-300">
            {formatCurrency(servico.preco)}
          </p>
          <p className="font-roboto text-xs text-zinc-500">Preço atual</p>
        </div>
      ) : null}
    </li>
  );
}

type LoadResult = { attempt: number; id: number; tipo: TipoHistorico } & (
  | { agendamentos: Agendamento[]; type: "success" }
  | { message: string; type: "error" }
);

interface AppointmentHistoryDialogProps {
  onClose: () => void;
  pessoa: ReferenciaAgenda;
  tipo: TipoHistorico;
}

export function AppointmentHistoryDialog({
  onClose,
  pessoa,
  tipo,
}: AppointmentHistoryDialogProps) {
  const { id, nome } = pessoa;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);

  useEffect(() => {
    let isActive = true;
    listarHistoricoAtendimentos(tipo, id)
      .then((agendamentos) => {
        if (isActive) {
          setResult({ agendamentos, attempt, id, tipo, type: "success" });
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({
            attempt,
            id,
            message: getApiErrorMessage(error, LOAD_ERROR_MESSAGE),
            tipo,
            type: "error",
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [attempt, id, tipo]);

  const retry = useCallback(() => setAttempt((previous) => previous + 1), []);
  const current =
    result?.attempt === attempt && result.id === id && result.tipo === tipo
      ? result
      : null;

  let content: ReactNode;
  if (current === null) {
    content = <LoadingPanel label="Carregando histórico..." />;
  } else if (current.type === "error") {
    content = (
      <div className="flex flex-col gap-3">
        <FormAlert message={current.message} />
        <button
          className="self-start rounded-lg border border-zinc-700 px-3 py-2 font-roboto-medium text-brand text-sm transition hover:border-brand"
          onClick={retry}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    );
  } else if (current.agendamentos.length === 0) {
    content = (
      <p className="rounded-2xl border border-zinc-800 border-dashed px-5 py-10 text-center font-roboto-medium text-sm text-zinc-300">
        Nenhum atendimento concluído.
      </p>
    );
  } else {
    content = (
      <ul className="flex flex-col gap-3">
        {current.agendamentos.map((agendamento) => (
          <HistoryEntry
            agendamento={agendamento}
            key={agendamento.id}
            tipo={tipo}
          />
        ))}
      </ul>
    );
  }

  return (
    <Dialog
      description={`Atendimentos concluídos de ${nome}.`}
      isOpen
      onClose={onClose}
      title="Histórico de atendimentos"
    >
      {content}
    </Dialog>
  );
}
