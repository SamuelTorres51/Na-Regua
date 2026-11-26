import type { FormEvent } from "react";
import { useCallback, useRef, useState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { SpinnerIcon } from "@/components/ui/icons";
import {
  ordenarTurnos,
  type Turno,
  turnosIguais,
  validarTurnos,
} from "@/features/business-hours/schedule";
import { useTurnosEditor } from "@/features/business-hours/use-turnos-editor";
import { useUnsavedChanges } from "@/features/unsaved-changes";
import { getApiErrorMessage } from "@/services/api-client";
import { updateBusinessHours } from "@/services/business-hours";
import { WeeklyHoursEditor } from "./weekly-hours-editor";

const SAVE_ERROR_MESSAGE =
  "Não foi possível salvar o expediente. Tente novamente.";

interface Feedback {
  message: string;
  type: "error" | "success";
}

interface BusinessHoursFormProps {
  turnos: Turno[];
}

export function BusinessHoursForm({ turnos }: BusinessHoursFormProps) {
  const [saved, setSaved] = useState(() => ordenarTurnos(turnos));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSubmitting = useRef<boolean>(false);

  const clearFeedback = useCallback(() => setFeedback(null), []);
  const editor = useTurnosEditor(saved, clearFeedback);
  const { resetDraft, turnos: payload } = editor;
  const hasChanges = !turnosIguais(saved, payload);
  useUnsavedChanges(hasChanges, isSaving);

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
          message: "Expediente salvo com sucesso.",
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
        <WeeklyHoursEditor editor={editor} />

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
