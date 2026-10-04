import { useCallback, useMemo } from "react";

import { getMonthGrid, isToday, toIsoDate } from "@/features/agenda/date-utils";
import type { Agendamento } from "@/features/agenda/types";

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

interface DayCellProps {
  count: number;
  date: Date;
  isCurrentMonth: boolean;
  onSelect: (date: Date) => void;
}

function DayCell({ count, date, isCurrentMonth, onSelect }: DayCellProps) {
  const handleClick = useCallback(() => onSelect(date), [onSelect, date]);

  const baseClass =
    "flex h-20 flex-col items-start justify-between rounded-xl border p-2 text-left transition-colors sm:h-24";
  const stateClass = isCurrentMonth
    ? "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
    : "border-transparent bg-transparent opacity-40 hover:border-zinc-800";

  return (
    <button
      className={`${baseClass} ${stateClass}`}
      onClick={handleClick}
      type="button"
    >
      <span
        className={
          isToday(date)
            ? "flex h-6 w-6 items-center justify-center rounded-full bg-brand font-roboto-semibold text-xs text-zinc-950"
            : "font-roboto text-xs text-zinc-300"
        }
      >
        {date.getDate()}
      </span>

      {count > 0 ? (
        <span className="rounded-full bg-brand/15 px-2 py-0.5 font-roboto-medium text-[10px] text-brand">
          {count} {count === 1 ? "atendimento" : "atendimentos"}
        </span>
      ) : null}
    </button>
  );
}

interface MonthViewProps {
  agendamentos: Agendamento[];
  onSelectDay: (date: Date) => void;
  referenceDate: Date;
}

export function MonthView({
  agendamentos,
  onSelectDay,
  referenceDate,
}: MonthViewProps) {
  const days = useMemo(() => getMonthGrid(referenceDate), [referenceDate]);

  const countByDay = useMemo(() => {
    const counts = new Map<string, number>();

    for (const agendamento of agendamentos) {
      const key = toIsoDate(new Date(agendamento.inicio));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }, [agendamentos]);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-3 sm:p-4">
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <p
            className="text-center font-roboto-medium text-xs text-zinc-500 uppercase"
            key={label}
          >
            {label}
          </p>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <DayCell
            count={countByDay.get(toIsoDate(day)) ?? 0}
            date={day}
            isCurrentMonth={day.getMonth() === referenceDate.getMonth()}
            key={day.toISOString()}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </div>
  );
}
