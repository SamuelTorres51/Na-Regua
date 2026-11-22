import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { ClockIcon, SpinnerIcon } from "@/components/ui/icons";
import {
  DIAS_SEMANA,
  NOMES_DIAS,
  ordenarTurnos,
  type Turno,
} from "@/features/business-hours/schedule";
import { useProfessionalSchedule } from "@/features/professionals/use-professional-schedule";
import { ProfessionalScheduleDialog } from "./professional-schedule-dialog";

interface WeeklyHoursSummaryProps {
  emptyDayLabel: string;
  turnos: Turno[];
}

function WeeklyHoursSummary({
  emptyDayLabel,
  turnos,
}: WeeklyHoursSummaryProps) {
  const ordered = ordenarTurnos(turnos);

  return (
    <dl className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-950/40 px-3">
      {DIAS_SEMANA.map((dia) => {
        const hours = ordered
          .filter(({ diaSemana }) => diaSemana === dia)
          .map(({ inicio, fim }) => `${inicio}–${fim}`)
          .join(" · ");

        return (
          <div
            className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-2.5 font-roboto text-xs"
            key={dia}
          >
            <dt className="font-roboto-medium text-zinc-300">
              {NOMES_DIAS[dia]}
            </dt>
            <dd className="text-zinc-400">{hours || emptyDayLabel}</dd>
          </div>
        );
      })}
    </dl>
  );
}

interface SchedulePreviewProps {
  expediente: Turno[] | null | undefined;
  turnos: Turno[] | null;
}

function SchedulePreview({ expediente, turnos }: SchedulePreviewProps) {
  const followsBarbershop = turnos === null;
  const weeklyHours = turnos ?? expediente;

  return (
    <>
      <p className="font-roboto-medium text-sm text-zinc-200">
        {followsBarbershop
          ? "Segue o expediente da barbearia"
          : "Jornada personalizada"}
      </p>
      {weeklyHours ? (
        <WeeklyHoursSummary
          emptyDayLabel={followsBarbershop ? "Fechado" : "Folga"}
          turnos={weeklyHours}
        />
      ) : (
        <p className="font-roboto text-sm text-zinc-400" role="status">
          {expediente === null
            ? "Não foi possível consultar o expediente da barbearia."
            : "Carregando expediente da barbearia..."}
        </p>
      )}
    </>
  );
}

interface ProfessionalScheduleCardProps {
  profissionalId: number;
  profissionalNome: string;
}

export function ProfessionalScheduleCard({
  profissionalId,
  profissionalNome,
}: ProfessionalScheduleCardProps) {
  const { acceptSaved, expediente, retry, schedule } =
    useProfessionalSchedule(profissionalId);
  const [isEditing, setIsEditing] = useState(false);
  const [didSave, setDidSave] = useState(false);

  const handleRetry = useCallback(() => {
    setDidSave(false);
    retry();
  }, [retry]);
  const openEditor = useCallback(() => {
    setDidSave(false);
    setIsEditing(true);
  }, []);
  const closeEditor = useCallback(() => setIsEditing(false), []);
  const handleSaved = useCallback(
    (turnos: Turno[] | null) => {
      acceptSaved(turnos);
      setIsEditing(false);
      setDidSave(true);
    },
    [acceptSaved]
  );

  const isReady = schedule?.type === "success";
  const followsBarbershop = isReady && schedule.turnos === null;
  const showRetry =
    schedule?.type === "error" ||
    (followsBarbershop && expediente?.turnos === null);

  let content: ReactNode;
  if (schedule === null) {
    content = (
      <p
        className="flex items-center gap-2 font-roboto text-sm text-zinc-400"
        role="status"
      >
        <SpinnerIcon className="h-4 w-4 animate-spin" />
        Carregando jornada...
      </p>
    );
  } else if (schedule.type === "error") {
    content = <FormAlert message={schedule.message} />;
  } else {
    content = (
      <SchedulePreview
        expediente={expediente?.turnos}
        turnos={schedule.turnos}
      />
    );
  }

  return (
    <div className="self-start rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-roboto-semibold text-base text-white">
          Jornada de trabalho
        </h2>
        <ClockIcon className="h-5 w-5 shrink-0 text-zinc-500" />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {content}
        {showRetry ? (
          <button
            className="self-start rounded-lg border border-zinc-700 px-3 py-2 font-roboto-medium text-brand text-xs transition hover:border-brand"
            disabled={isEditing}
            onClick={handleRetry}
            type="button"
          >
            Tentar novamente
          </button>
        ) : null}
        {didSave ? (
          <p className="font-roboto text-emerald-300 text-sm" role="status">
            Jornada salva com sucesso.
          </p>
        ) : null}
        {isReady ? (
          <button
            className="h-10 self-start rounded-xl border border-brand/40 px-4 font-roboto-medium text-brand text-sm transition hover:bg-brand/10"
            onClick={openEditor}
            type="button"
          >
            Editar jornada
          </button>
        ) : null}
      </div>
      {isEditing && isReady ? (
        <ProfessionalScheduleDialog
          expediente={expediente?.turnos ?? null}
          onClose={closeEditor}
          onSaved={handleSaved}
          profissionalId={profissionalId}
          profissionalNome={profissionalNome}
          turnos={schedule.turnos}
        />
      ) : null}
    </div>
  );
}
