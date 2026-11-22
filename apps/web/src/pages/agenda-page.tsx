import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { AgendaFiltersBar } from "@/components/agenda/agenda-filters";
import { AgendaToolbar } from "@/components/agenda/agenda-toolbar";
import { DayView } from "@/components/agenda/day-view";
import { MonthView } from "@/components/agenda/month-view";
import { NewAppointmentDialog } from "@/components/agenda/new-appointment-dialog";
import { WeekView } from "@/components/agenda/week-view";
import { ErrorPanel, LoadingPanel } from "@/components/ui/state-panels";
import {
  formatFullDate,
  formatMonthYear,
  formatShortDate,
  getAgendaDate,
  getWeekDays,
  toIsoDate,
} from "@/features/agenda/date-utils";
import type { Agendamento } from "@/features/agenda/types";
import { useAgenda } from "@/features/agenda/use-agenda";

export function AgendaPage() {
  const {
    agendamentos,
    canCreateAppointment,
    clearFilters,
    error,
    filters,
    goToNext,
    goToPrevious,
    goToToday,
    isLoading,
    profissional,
    profissionais,
    referenceDate,
    refresh,
    selectDate,
    servicos,
    setFilter,
    setReferenceDate,
    setView,
    view,
  } = useAgenda();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [didCreate, setDidCreate] = useState(false);

  const handleOpenDialog = useCallback(() => {
    setDidCreate(false);
    setIsDialogOpen(true);
  }, []);
  const handleCloseDialog = useCallback(() => setIsDialogOpen(false), []);
  const handleCreated = useCallback(
    ({ inicio }: Agendamento) => {
      setReferenceDate(getAgendaDate(new Date(inicio)));
      refresh();
      setIsDialogOpen(false);
      setDidCreate(true);
    },
    [refresh, setReferenceDate]
  );

  const title = useMemo(() => {
    if (view === "semana") {
      const [first, ...remainingDays] = getWeekDays(referenceDate);
      const last = remainingDays.at(-1) ?? first;

      return `${formatShortDate(first)} – ${formatShortDate(last)}`;
    }

    return view === "mes"
      ? formatMonthYear(referenceDate)
      : formatFullDate(referenceDate);
  }, [view, referenceDate]);

  let content: ReactNode;

  if (isLoading) {
    content = <LoadingPanel label="Carregando agenda..." />;
  } else if (error) {
    content = <ErrorPanel message={error} />;
  } else if (view === "dia") {
    const visibleProfessionals = filters.profissionalId
      ? profissionais.filter(({ id }) => String(id) === filters.profissionalId)
      : profissionais;

    content = (
      <DayView
        agendamentos={agendamentos}
        profissionais={visibleProfessionals}
      />
    );
  } else if (view === "semana") {
    content = (
      <WeekView agendamentos={agendamentos} referenceDate={referenceDate} />
    );
  } else {
    content = (
      <MonthView
        agendamentos={agendamentos}
        onSelectDay={selectDate}
        referenceDate={referenceDate}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AgendaToolbar
        onNewAppointment={canCreateAppointment ? handleOpenDialog : undefined}
        onNext={goToNext}
        onPrevious={goToPrevious}
        onToday={goToToday}
        onViewChange={setView}
        title={title}
        view={view}
      />

      <AgendaFiltersBar
        filters={filters}
        onClear={clearFilters}
        onDateChange={setReferenceDate}
        onFilterChange={setFilter}
        profissionais={profissionais}
        profissional={profissional}
        referenceDate={referenceDate}
        servicos={servicos}
      />

      {didCreate ? (
        <p
          className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 font-roboto text-emerald-300 text-sm"
          role="status"
        >
          Agendamento criado com sucesso.
        </p>
      ) : null}

      {content}

      {canCreateAppointment && isDialogOpen ? (
        <NewAppointmentDialog
          initialDate={toIsoDate(referenceDate)}
          onClose={handleCloseDialog}
          onCreated={handleCreated}
        />
      ) : null}
    </div>
  );
}
