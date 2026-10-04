import { useMemo } from "react";
import {
  formatShortDate,
  formatShortWeekday,
  getWeekDays,
  isSameDay,
  isToday,
} from "@/features/agenda/date-utils";
import type {
  Agendamento,
  Profissional,
  Servico,
} from "@/features/agenda/types";
import { AgendaEmptyState } from "./agenda-empty-state";
import { AppointmentCard } from "./appointment-card";

interface WeekViewProps {
  agendamentos: Agendamento[];
  profissionais: Profissional[];
  referenceDate: Date;
  servicos: Servico[];
}

export function WeekView({
  agendamentos,
  profissionais,
  referenceDate,
  servicos,
}: WeekViewProps) {
  const days = useMemo(() => getWeekDays(referenceDate), [referenceDate]);

  const profissionalNames = useMemo(
    () => new Map(profissionais.map((item) => [item.id, item.nome])),
    [profissionais]
  );

  const servicoNames = useMemo(
    () => new Map(servicos.map((item) => [item.id, item.nome])),
    [servicos]
  );

  const hasAppointments = useMemo(
    () =>
      agendamentos.some((item) =>
        days.some((day) => isSameDay(new Date(item.inicio), day))
      ),
    [agendamentos, days]
  );

  if (!hasAppointments) {
    return (
      <AgendaEmptyState
        description="Não há atendimentos marcados nesta semana. Ajuste os filtros ou crie um novo agendamento."
        title="Semana sem agendamentos"
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
      {days.map((day) => {
        const dayAppointments = agendamentos
          .filter((item) => isSameDay(new Date(item.inicio), day))
          .sort(
            (first, second) =>
              new Date(first.inicio).getTime() -
              new Date(second.inicio).getTime()
          );

        return (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-3"
            key={day.toISOString()}
          >
            <div
              className={
                isToday(day)
                  ? "rounded-xl bg-brand/10 px-2 py-1.5 text-center"
                  : "rounded-xl px-2 py-1.5 text-center"
              }
            >
              <p
                className={
                  isToday(day)
                    ? "font-roboto-semibold text-brand text-xs uppercase"
                    : "font-roboto text-xs text-zinc-500 uppercase"
                }
              >
                {formatShortWeekday(day)}
              </p>
              <p className="font-roboto-medium text-sm text-white">
                {formatShortDate(day)}
              </p>
            </div>

            {dayAppointments.length === 0 ? (
              <p className="py-6 text-center font-roboto text-xs text-zinc-600">
                Sem atendimentos
              </p>
            ) : (
              dayAppointments.map((agendamento) => (
                <AppointmentCard
                  agendamento={agendamento}
                  key={agendamento.id}
                  profissionalNome={profissionalNames.get(
                    agendamento.profissionalId
                  )}
                  servicoNome={servicoNames.get(agendamento.servicoId)}
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
