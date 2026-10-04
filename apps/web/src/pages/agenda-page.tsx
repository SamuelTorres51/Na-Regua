import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { AgendaFiltersBar } from "@/components/agenda/agenda-filters";
import { AgendaToolbar } from "@/components/agenda/agenda-toolbar";
import { DayView } from "@/components/agenda/day-view";
import { MonthView } from "@/components/agenda/month-view";
import { NewAppointmentDialog } from "@/components/agenda/new-appointment-dialog";
import { WeekView } from "@/components/agenda/week-view";
import { SpinnerIcon } from "@/components/ui/icons";
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
    content = (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/30 py-16 text-zinc-400">
        <SpinnerIcon className="h-5 w-5 animate-spin" />
        <span className="font-roboto text-sm">Carregando agenda...</span>
      </div>
    );
  } else if (error) {
    content = (
      <div
        className="rounded-3xl border border-danger/40 bg-danger/10 px-6 py-10 text-center"
        role="alert"
      >
        <p className="font-roboto-medium text-danger text-sm">{error}</p>
      </div>
    );
  } else if (view === "dia") {
    content = (
      <DayView
        agendamentos={agendamentos}
        date={referenceDate}
        profissionais={profissionais}
        servicos={servicos}
      />
    );
  } else if (view === "semana") {
    content = (
      <WeekView
        agendamentos={agendamentos}
        profissionais={profissionais}
        referenceDate={referenceDate}
        servicos={servicos}
      />
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
