import type { ChangeEvent } from "react";
import { useCallback, useMemo } from "react";

import { SelectField } from "@/components/ui/select-field";
import { parseIsoDate, toIsoDate } from "@/features/agenda/date-utils";
import { STATUS_LABELS } from "@/features/agenda/status";
import {
  type AgendaFilters,
  type Profissional,
  type Servico,
  STATUS_AGENDAMENTO,
  type StatusAgendamento,
} from "@/features/agenda/types";

interface AgendaFiltersBarProps {
  filters: AgendaFilters;
  onClear: () => void;
  onDateChange: (date: Date) => void;
  onFilterChange: <Key extends keyof AgendaFilters>(
    key: Key,
    value: AgendaFilters[Key]
  ) => void;
  profissionais: Profissional[];
  referenceDate: Date;
  servicos: Servico[];
}

export function AgendaFiltersBar({
  filters,
  onClear,
  onDateChange,
  onFilterChange,
  profissionais,
  referenceDate,
  servicos,
}: AgendaFiltersBarProps) {
  const profissionalOptions = useMemo(
    () => [
      { label: "Todos os profissionais", value: "" },
      ...profissionais.map((item) => ({ label: item.nome, value: item.id })),
    ],
    [profissionais]
  );

  const servicoOptions = useMemo(
    () => [
      { label: "Todos os serviços", value: "" },
      ...servicos.map((item) => ({ label: item.nome, value: item.id })),
    ],
    [servicos]
  );

  const statusOptions = useMemo(
    () => [
      { label: "Todos os status", value: "" },
      ...STATUS_AGENDAMENTO.map((status) => ({
        label: STATUS_LABELS[status],
        value: status,
      })),
    ],
    []
  );

  const handleProfissionalChange = useCallback(
    (value: string) => onFilterChange("profissionalId", value),
    [onFilterChange]
  );

  const handleServicoChange = useCallback(
    (value: string) => onFilterChange("servicoId", value),
    [onFilterChange]
  );

  const handleStatusChange = useCallback(
    (value: string) =>
      onFilterChange("status", value as StatusAgendamento | ""),
    [onFilterChange]
  );

  const handleDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const parsed = parseIsoDate(event.target.value);

      if (parsed) {
        onDateChange(parsed);
      }
    },
    [onDateChange]
  );

  const hasActiveFilters = Boolean(
    filters.profissionalId || filters.servicoId || filters.status
  );

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField
          label="Profissional"
          onChange={handleProfissionalChange}
          options={profissionalOptions}
          value={filters.profissionalId}
        />
        <SelectField
          label="Serviço"
          onChange={handleServicoChange}
          options={servicoOptions}
          value={filters.servicoId}
        />
        <SelectField
          label="Status"
          onChange={handleStatusChange}
          options={statusOptions}
          value={filters.status}
        />

        <div className="flex flex-col gap-2">
          <label
            className="font-roboto-medium text-xs text-zinc-400"
            htmlFor="agenda-date"
          >
            Data
          </label>
          <input
            className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 font-roboto text-sm text-white outline-none transition-colors hover:border-zinc-600 focus:border-brand"
            id="agenda-date"
            onChange={handleDateChange}
            type="date"
            value={toIsoDate(referenceDate)}
          />
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="mt-4 flex justify-end">
          <button
            className="font-roboto-medium text-brand text-xs transition-opacity hover:opacity-80"
            onClick={onClear}
            type="button"
          >
            Limpar filtros
          </button>
        </div>
      ) : null}
    </section>
  );
}
