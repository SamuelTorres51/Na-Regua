import { Fragment } from "react";
import {
  formatMinutes,
  getAgendaDate,
  getTimeSlots,
  minutesOfDay,
  TIME_SLOT_END_MINUTES,
  TIME_SLOT_START_MINUTES,
  TIME_SLOT_STEP_MINUTES,
} from "@/features/agenda/date-utils";
import type { Agendamento, ReferenciaAgenda } from "@/features/agenda/types";
import { AgendaEmptyState } from "./agenda-empty-state";
import { AppointmentCard } from "./appointment-card";

interface DayViewProps {
  agendamentos: Agendamento[];
  profissionais: ReferenciaAgenda[];
}

function slotKey(profissionalId: number | null, minutes: number) {
  return `${profissionalId}-${minutes}`;
}

function getDayGrid({ agendamentos, profissionais }: DayViewProps) {
  const columns = new Map<number | null, string>(
    profissionais.map(({ id, nome }) => [id, nome])
  );
  const appointmentsBySlot = new Map<string, Agendamento[]>();
  let startMinutes = TIME_SLOT_START_MINUTES;
  let endMinutes = TIME_SLOT_END_MINUTES;

  for (const agendamento of agendamentos) {
    const { inicio, profissional } = agendamento;
    const profissionalId = profissional?.id ?? null;
    const minutes = minutesOfDay(getAgendaDate(new Date(inicio)));
    const slot = minutes - (minutes % TIME_SLOT_STEP_MINUTES);
    const key = slotKey(profissionalId, slot);
    const appointments = appointmentsBySlot.get(key) ?? [];

    appointments.push(agendamento);
    appointmentsBySlot.set(key, appointments);
    columns.set(profissionalId, profissional?.nome ?? "Sem profissional");
    startMinutes = Math.min(startMinutes, slot);
    endMinutes = Math.max(endMinutes, slot + TIME_SLOT_STEP_MINUTES);
  }

  return {
    appointmentsBySlot,
    columns: Array.from(columns),
    slots: getTimeSlots(startMinutes, endMinutes),
  };
}

export function DayView({ agendamentos, profissionais }: DayViewProps) {
  if (agendamentos.length === 0) {
    return (
      <AgendaEmptyState
        description="Não há atendimentos marcados para esta data. Use “Novo agendamento” para registrar um horário."
        title="Nenhum agendamento neste dia"
      />
    );
  }

  const { appointmentsBySlot, columns, slots } = getDayGrid({
    agendamentos,
    profissionais,
  });
  const columnTemplate = `4.5rem repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/30">
      <div className="min-w-[40rem]">
        <div
          className="grid border-zinc-800 border-b"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div className="px-3 py-3" />
          {columns.map(([id, name]) => (
            <div
              className="border-zinc-800 border-l px-3 py-3 font-roboto-medium text-sm text-zinc-200"
              key={id ?? "sem-profissional"}
            >
              {name}
            </div>
          ))}
        </div>

        <div
          className="grid auto-rows-[minmax(3rem,auto)]"
          style={{
            gridTemplateColumns: columnTemplate,
          }}
        >
          {slots.map((minutes) => (
            <Fragment key={minutes}>
              <div className="border-zinc-800 border-t py-1 pr-3 text-right font-roboto text-xs text-zinc-500">
                {formatMinutes(minutes)}
              </div>
              {columns.map(([id]) => (
                <div
                  className="flex min-w-0 flex-col gap-1.5 border-zinc-800 border-t border-l px-1.5 py-1"
                  key={id ?? "sem-profissional"}
                >
                  {appointmentsBySlot
                    .get(slotKey(id, minutes))
                    ?.map((agendamento) => (
                      <AppointmentCard
                        agendamento={agendamento}
                        key={agendamento.id}
                      />
                    ))}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
