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
  getWeekDays,
} from "@/features/agenda/date-utils";
import { useAgenda } from "@/features/agenda/use-agenda";

export function AgendaPage() {
  const {
    agendamentos,
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
    selectDate,
    servicos,
    setFilter,
    setReferenceDate,
    setView,
    view,
  } = useAgenda();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = useCallback(() => setIsDialogOpen(true), []);
  const handleCloseDialog = useCallback(() => setIsDialogOpen(false), []);

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
        onNewAppointment={handleOpenDialog}
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

      {content}

      <NewAppointmentDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        profissionais={profissionais}
        servicos={servicos}
      />
    </div>
  );
}
