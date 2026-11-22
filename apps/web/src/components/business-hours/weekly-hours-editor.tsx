import { DIAS_SEMANA } from "@/features/business-hours/schedule";
import type { useTurnosEditor } from "@/features/business-hours/use-turnos-editor";
import { DayHours } from "./day-hours";

interface WeeklyHoursEditorProps {
  editor: ReturnType<typeof useTurnosEditor>;
  emptyDayLabel?: string;
}

export function WeeklyHoursEditor({
  editor,
  emptyDayLabel = "Fechado",
}: WeeklyHoursEditorProps) {
  const { addTurno, changeTurno, draft, removeTurno } = editor;

  return (
    <div className="@container divide-y divide-zinc-800 rounded-3xl border border-zinc-800 bg-zinc-900/30">
      {DIAS_SEMANA.map((diaSemana) => (
        <DayHours
          diaSemana={diaSemana}
          emptyDayLabel={emptyDayLabel}
          key={diaSemana}
          onAdd={addTurno}
          onChange={changeTurno}
          onRemove={removeTurno}
          turnos={draft.filter((turno) => turno.diaSemana === diaSemana)}
        />
      ))}
    </div>
  );
}
