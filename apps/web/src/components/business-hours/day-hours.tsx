// biome-ignore-all lint/performance/noJsxPropsBind: each control edits a specific shift
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import {
  type DiaSemana,
  NOMES_DIAS,
  type Turno,
} from "@/features/business-hours/schedule";

export interface EditableTurno extends Turno {
  id: number;
}

type TimeField = "inicio" | "fim";

interface HourInputProps {
  label: string;
  onChange: (value: string) => void;
  value: string;
}

function HourInput({ label, onChange, value }: HourInputProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2 font-roboto-medium text-xs text-zinc-400">
      {label}
      <input
        className="h-11 w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 font-roboto text-sm text-white outline-none transition-colors [color-scheme:dark] hover:border-zinc-600 focus:border-brand"
        onChange={(event) => onChange(event.target.value)}
        required
        type="time"
        value={value}
      />
    </label>
  );
}

interface DayHoursProps {
  diaSemana: DiaSemana;
  onAdd: (day: DiaSemana) => void;
  onChange: (id: number, field: TimeField, value: string) => void;
  onRemove: (id: number) => void;
  turnos: EditableTurno[];
}

export function DayHours({
  diaSemana,
  onAdd,
  onChange,
  onRemove,
  turnos,
}: DayHoursProps) {
  const dayLabel = NOMES_DIAS[diaSemana];

  return (
    <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="flex flex-wrap items-center gap-2 self-start">
        <h2 className="font-roboto-semibold text-sm text-white">{dayLabel}</h2>
        {turnos.length === 0 ? (
          <span className="rounded-full bg-zinc-800 px-2.5 py-1 font-roboto-medium text-xs text-zinc-400">
            Fechado
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col items-start gap-3">
        {turnos.map((turno, index) => {
          const shiftLabel = `turno ${index + 1} de ${dayLabel}`;

          return (
            <fieldset
              className="grid w-full max-w-lg grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-3"
              key={turno.id}
            >
              <legend className="sr-only">{shiftLabel}</legend>
              <div className="col-span-2 sm:col-span-1">
                <HourInput
                  label="Abertura"
                  onChange={(value) => onChange(turno.id, "inicio", value)}
                  value={turno.inicio}
                />
              </div>
              <HourInput
                label="Fechamento"
                onChange={(value) => onChange(turno.id, "fim", value)}
                value={turno.fim}
              />
              <button
                aria-label={`Remover ${shiftLabel}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger disabled:opacity-60"
                onClick={() => onRemove(turno.id)}
                title="Remover turno"
                type="button"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </fieldset>
          );
        })}

        <button
          aria-label={`Adicionar turno de ${dayLabel}`}
          className="flex h-9 items-center gap-2 rounded-xl border border-brand/40 px-3 font-roboto-medium text-brand text-xs transition-colors hover:bg-brand/10 disabled:opacity-60"
          onClick={() => onAdd(diaSemana)}
          type="button"
        >
          <PlusIcon className="h-4 w-4" />
          Adicionar turno
        </button>
      </div>
    </div>
  );
}
