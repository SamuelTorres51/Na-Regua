import { Fragment, useMemo } from "react";
import {
  formatMinutes,
  getTimeSlots,
  isSameDay,
  minutesOfDay,
  TIME_SLOT_START_MINUTES,
  TIME_SLOT_STEP_MINUTES,
} from "@/features/agenda/date-utils";
import type {
  Agendamento,
  Profissional,
  Servico,
} from "@/features/agenda/types";
import { AgendaEmptyState } from "./agenda-empty-state";
import { AppointmentCard } from "./appointment-card";

interface DayViewProps {
  agendamentos: Agendamento[];
  date: Date;
  profissionais: Profissional[];
  servicos: Servico[];
}

export function DayView({
  agendamentos,
  date,
  profissionais,
  servicos,
}: DayViewProps) {
  const columns = useMemo(
    () =>
      profissionais.length > 0 ? profissionais : [{ id: "", nome: "Agenda" }],
    [profissionais]
  );

  const profissionalNames = useMemo(
    () => new Map(profissionais.map((item) => [item.id, item.nome])),
    [profissionais]
  );

  const servicoNames = useMemo(
    () => new Map(servicos.map((item) => [item.id, item.nome])),
    [servicos]
  );

  const dayAgendamentos = useMemo(
    () =>
      agendamentos
        .filter((item) => isSameDay(new Date(item.inicio), date))
        .sort(
          (first, second) =>
            new Date(first.inicio).getTime() - new Date(second.inicio).getTime()
        ),
    [agendamentos, date]
  );

  if (dayAgendamentos.length === 0) {
    return (
      <AgendaEmptyState
        description="Não há atendimentos marcados para esta data. Use “Novo agendamento” para registrar um horário."
        title="Nenhum agendamento neste dia"
      />
    );
  }

  const slots = getTimeSlots();
  const columnTemplate = `4.5rem repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/30">
      <div className="min-w-[40rem]">
        <div
          className="grid border-zinc-800 border-b"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div className="px-3 py-3" />
          {columns.map((column) => (
            <div
              className="border-zinc-800 border-l px-3 py-3 font-roboto-medium text-sm text-zinc-200"
              key={column.id}
            >
              {column.nome}
            </div>
          ))}
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: columnTemplate,
            gridTemplateRows: `repeat(${slots.length}, 3rem)`,
          }}
        >
          {slots.map((minutes, index) => (
            <Fragment key={minutes}>
              <div className="border-zinc-800 border-t py-1 pr-3 text-right font-roboto text-xs text-zinc-500">
                {index === 0 ? "" : formatMinutes(minutes)}
              </div>
              {columns.map((column) => (
                <div
                  className="border-zinc-800 border-t border-l"
                  key={`${column.id}-${minutes}`}
                />
              ))}
            </Fragment>
          ))}

          {dayAgendamentos.map((agendamento) => {
            const columnIndex = columns.findIndex(
              (column) => column.id === agendamento.profissionalId
            );
            const startSlot = Math.max(
              0,
              Math.floor(
                (minutesOfDay(new Date(agendamento.inicio)) -
                  TIME_SLOT_START_MINUTES) /
                  TIME_SLOT_STEP_MINUTES
              )
            );
            const span = Math.max(
              1,
              Math.ceil(agendamento.duracaoMinutos / TIME_SLOT_STEP_MINUTES)
            );

            return (
              <div
                className="z-10 px-1.5 py-1"
                key={agendamento.id}
                style={{
                  gridColumn: (columnIndex >= 0 ? columnIndex : 0) + 2,
                  gridRow: `${startSlot + 1} / span ${span}`,
                }}
              >
                <AppointmentCard
                  agendamento={agendamento}
                  profissionalNome={profissionalNames.get(
                    agendamento.profissionalId
                  )}
                  servicoNome={servicoNames.get(agendamento.servicoId)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
