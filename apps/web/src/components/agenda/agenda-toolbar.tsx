import { useCallback } from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@/components/ui/icons";
import type { AgendaView } from "@/features/agenda/types";

const VIEW_OPTIONS: { label: string; value: AgendaView }[] = [
  { label: "Dia", value: "dia" },
  { label: "Semana", value: "semana" },
  { label: "Mês", value: "mes" },
];

interface ViewToggleButtonProps {
  isActive: boolean;
  label: string;
  onSelect: (view: AgendaView) => void;
  value: AgendaView;
}

function ViewToggleButton({
  isActive,
  label,
  onSelect,
  value,
}: ViewToggleButtonProps) {
  const handleClick = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <button
      aria-pressed={isActive}
      className={
        isActive
          ? "rounded-lg bg-brand px-3 py-1.5 font-roboto-medium text-sm text-zinc-950"
          : "rounded-lg px-3 py-1.5 font-roboto text-sm text-zinc-400 transition-colors hover:text-white"
      }
      onClick={handleClick}
      type="button"
    >
      {label}
    </button>
  );
}

interface AgendaToolbarProps {
  onNewAppointment: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
  onViewChange: (view: AgendaView) => void;
  title: string;
  view: AgendaView;
}

export function AgendaToolbar({
  onNewAppointment,
  onNext,
  onPrevious,
  onToday,
  onViewChange,
  title,
  view,
}: AgendaToolbarProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          aria-label="Período anterior"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
          onClick={onPrevious}
          type="button"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <p className="min-w-44 px-2 text-center font-roboto-semibold text-base text-white capitalize">
          {title}
        </p>

        <button
          aria-label="Próximo período"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
          onClick={onNext}
          type="button"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        <button
          className="h-10 rounded-xl border border-zinc-800 px-4 font-roboto-medium text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
          onClick={onToday}
          type="button"
        >
          Hoje
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          {VIEW_OPTIONS.map((option) => (
            <ViewToggleButton
              isActive={option.value === view}
              key={option.value}
              label={option.label}
              onSelect={onViewChange}
              value={option.value}
            />
          ))}
        </div>

        <button
          className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 font-roboto font-semibold text-sm text-zinc-950 transition duration-150 hover:brightness-110 active:scale-[0.99]"
          onClick={onNewAppointment}
          type="button"
        >
          <PlusIcon className="h-4 w-4" />
          Novo agendamento
        </button>
      </div>
    </div>
  );
}
