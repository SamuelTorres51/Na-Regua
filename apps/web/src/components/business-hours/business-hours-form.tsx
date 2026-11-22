import type { FormEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { SpinnerIcon } from "@/components/ui/icons";
import {
  DIAS_SEMANA,
  type DiaSemana,
  ordenarTurnos,
  type Turno,
  validarTurnos,
} from "@/features/business-hours/schedule";
import { getApiErrorMessage, isApiEnabled } from "@/services/api-client";
import { updateBusinessHours } from "@/services/business-hours";
import { DayHours, type EditableTurno } from "./day-hours";

const SAVE_ERROR_MESSAGE =
  "Não foi possível salvar o expediente. Tente novamente.";

interface Feedback {
  message: string;
  type: "error" | "success";
}

function toDraft(turnos: Turno[]): EditableTurno[] {
  return turnos.map((turno, id) => ({ ...turno, id }));
}

interface BusinessHoursFormProps {
  turnos: Turno[];
}

export function BusinessHoursForm({ turnos }: BusinessHoursFormProps) {
  const [saved, setSaved] = useState(() => ordenarTurnos(turnos));
  const [draft, setDraft] = useState(() => toDraft(saved));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const nextId = useRef(turnos.length);
  const isSubmitting = useRef<boolean>(false);

  const payload = useMemo(
    () =>
      ordenarTurnos(
        draft.map(({ diaSemana, fim, inicio }) => ({ diaSemana, fim, inicio }))
      ),
    [draft]
  );
  const hasChanges =
    saved.length !== payload.length ||
    payload.some(({ diaSemana, fim, inicio }, index) => {
      const original = saved.at(index);
      return (
        original?.diaSemana !== diaSemana ||
        original.fim !== fim ||
        original.inicio !== inicio
      );
    });

  const addTurno = useCallback((diaSemana: DiaSemana) => {
    const id = nextId.current;
    nextId.current += 1;
    setDraft((current) => [...current, { diaSemana, fim: "", id, inicio: "" }]);
    setFeedback(null);
  }, []);

  const changeTurno = useCallback(
    (id: number, field: "inicio" | "fim", value: string) => {
      setDraft((current) =>
        current.map((turno) =>
          turno.id === id ? { ...turno, [field]: value } : turno
        )
      );
      setFeedback(null);
    },
    []
  );

  const removeTurno = useCallback((id: number) => {
    setDraft((current) => current.filter((turno) => turno.id !== id));
    setFeedback(null);
  }, []);

  const resetDraft = useCallback((nextTurnos: Turno[]) => {
    nextId.current = nextTurnos.length;
    setDraft(toDraft(nextTurnos));
  }, []);

  const discardChanges = useCallback(() => {
    resetDraft(saved);
    setFeedback(null);
  }, [resetDraft, saved]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting.current || !hasChanges) {
        return;
      }

      const validationError = validarTurnos(payload);
      if (validationError) {
        setFeedback({ message: validationError, type: "error" });
        return;
      }

      isSubmitting.current = true;
      setIsSaving(true);
      setFeedback(null);
      try {
        const response = await updateBusinessHours(payload);
        const confirmed = ordenarTurnos(response.turnos);
        setSaved(confirmed);
        resetDraft(confirmed);
        setFeedback({
          message: isApiEnabled
            ? "Expediente salvo com sucesso."
            : "Expediente atualizado no modo de demonstração.",
          type: "success",
        });
      } catch (error) {
        setFeedback({
          message: getApiErrorMessage(error, SAVE_ERROR_MESSAGE),
          type: "error",
        });
      } finally {
        isSubmitting.current = false;
        setIsSaving(false);
      }
    },
    [hasChanges, payload, resetDraft]
  );

  return (
    <form noValidate onSubmit={handleSubmit}>
      <fieldset className="flex min-w-0 flex-col gap-4" disabled={isSaving}>
        <div className="divide-y divide-zinc-800 rounded-3xl border border-zinc-800 bg-zinc-900/30">
          {DIAS_SEMANA.map((diaSemana) => (
            <DayHours
              diaSemana={diaSemana}
              key={diaSemana}
              onAdd={addTurno}
              onChange={changeTurno}
              onRemove={removeTurno}
              turnos={draft.filter((turno) => turno.diaSemana === diaSemana)}
            />
          ))}
        </div>

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

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!hasChanges}
            onClick={discardChanges}
            type="button"
          >
            Descartar alterações
          </button>
          <button
            aria-busy={isSaving}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!hasChanges || isSaving}
            type="submit"
          >
            {isSaving ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Salvando..." : "Salvar expediente"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
