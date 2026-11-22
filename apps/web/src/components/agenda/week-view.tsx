import { useMemo } from "react";
import {
  formatShortDate,
  formatShortWeekday,
  getAgendaDate,
  getWeekDays,
  isSameDay,
  isToday,
} from "@/features/agenda/date-utils";
import type { Agendamento } from "@/features/agenda/types";
import { AgendaEmptyState } from "./agenda-empty-state";
import { AppointmentCard } from "./appointment-card";

interface WeekViewProps {
  agendamentos: Agendamento[];
  canManageAppointment: (agendamento: Agendamento) => boolean;
  onManageAppointment: (agendamento: Agendamento) => void;
  referenceDate: Date;
}

export function WeekView({
  agendamentos,
  canManageAppointment,
  onManageAppointment,
  referenceDate,
}: WeekViewProps) {
  const days = useMemo(() => getWeekDays(referenceDate), [referenceDate]);

  if (agendamentos.length === 0) {
    return (
      <AgendaEmptyState
        description="Escolha outra semana ou ajuste os filtros para consultar outros atendimentos."
        title="Semana sem agendamentos"
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
      {days.map((day) => {
        const dayAppointments = agendamentos
          .filter((item) =>
            isSameDay(getAgendaDate(new Date(item.inicio)), day)
          )
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
                  onManage={
                    canManageAppointment(agendamento)
                      ? onManageAppointment
                      : undefined
                  }
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
