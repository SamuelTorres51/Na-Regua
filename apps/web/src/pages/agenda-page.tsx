import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { AgendaFiltersBar } from "@/components/agenda/agenda-filters";
import { AgendaToolbar } from "@/components/agenda/agenda-toolbar";
import { DayView } from "@/components/agenda/day-view";
import { ManageAppointmentDialog } from "@/components/agenda/manage-appointment-dialog";
import { MonthView } from "@/components/agenda/month-view";
import { NewAppointmentDialog } from "@/components/agenda/new-appointment-dialog";
import { WeekView } from "@/components/agenda/week-view";
import { FormAlert } from "@/components/ui/form-alert";
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

type AgendaDialog =
  | { type: "create" }
  | { agendamento: Agendamento; type: "manage" };

interface AgendaFeedback {
  message: string;
  type: "error" | "success";
}

export function AgendaPage() {
  const {
    agendamentos,
    canCreateAppointment,
    canManageAppointment,
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
    setPreferredView,
    setReferenceDate,
    view,
  } = useAgenda();

  const [dialog, setDialog] = useState<AgendaDialog | null>(null);
  const [feedback, setFeedback] = useState<AgendaFeedback | null>(null);

  const handleOpenDialog = useCallback(() => {
    setFeedback(null);
    setDialog({ type: "create" });
  }, []);
  const handleOpenManagement = useCallback(
    (agendamento: Agendamento) => {
      if (canManageAppointment(agendamento)) {
        setFeedback(null);
        setDialog({ agendamento, type: "manage" });
      }
    },
    [canManageAppointment]
  );
  const handleCloseDialog = useCallback(() => setDialog(null), []);
  const handleFinish = useCallback(
    (message: string, type: AgendaFeedback["type"]) => {
      setFeedback({ message, type });
      setDialog(null);
      refresh();
    },
    [refresh]
  );
  const handleCreated = useCallback(
    ({ inicio }: Agendamento) => {
      setReferenceDate(getAgendaDate(new Date(inicio)));
      handleFinish("Agendamento criado com sucesso.", "success");
    },
    [handleFinish, setReferenceDate]
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
        canManageAppointment={canManageAppointment}
        onManageAppointment={handleOpenManagement}
        profissionais={visibleProfessionals}
      />
    );
  } else if (view === "semana") {
    content = (
      <WeekView
        agendamentos={agendamentos}
        canManageAppointment={canManageAppointment}
        onManageAppointment={handleOpenManagement}
        referenceDate={referenceDate}
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
    <>
      <div className="flex flex-col gap-6" inert={dialog !== null}>
        <AgendaToolbar
          onNewAppointment={canCreateAppointment ? handleOpenDialog : undefined}
          onNext={goToNext}
          onPrevious={goToPrevious}
          onToday={goToToday}
          onViewChange={setPreferredView}
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

        {feedback?.type === "error" ? (
          <FormAlert message={feedback.message} />
        ) : null}
        {feedback?.type === "success" ? (
          <p
            className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 font-roboto text-emerald-300 text-sm"
            role="status"
          >
            {feedback.message}
          </p>
        ) : null}

        {content}
      </div>

      {canCreateAppointment && dialog?.type === "create" ? (
        <NewAppointmentDialog
          initialDate={toIsoDate(referenceDate)}
          onClose={handleCloseDialog}
          onCreated={handleCreated}
        />
      ) : null}
      {dialog?.type === "manage" && canManageAppointment(dialog.agendamento) ? (
        <ManageAppointmentDialog
          agendamento={dialog.agendamento}
          onClose={handleCloseDialog}
          onFinish={handleFinish}
        />
      ) : null}
    </>
  );
}
