import type { FormEvent } from "react";
import { useCallback, useRef, useState } from "react";

import { WeeklyHoursEditor } from "@/components/business-hours/weekly-hours-editor";
import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { SpinnerIcon } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/select-field";
import {
  ordenarTurnos,
  type Turno,
  turnosIguais,
  validarTurnos,
} from "@/features/business-hours/schedule";
import { useTurnosEditor } from "@/features/business-hours/use-turnos-editor";
import { useFormClose } from "@/features/unsaved-changes";
import { getApiErrorMessage } from "@/services/api-client";
import { updateProfessionalSchedule } from "@/services/professional-schedule";

const OPTIONS = [
  { label: "Seguir o expediente da barbearia", value: "herdada" },
  { label: "Jornada personalizada", value: "personalizada" },
];
const SAVE_ERROR_MESSAGE =
  "Não foi possível salvar a jornada. Tente novamente.";

interface ProfessionalScheduleDialogProps {
  expediente: Turno[] | null;
  onClose: () => void;
  onSaved: (turnos: Turno[] | null) => void;
  profissionalId: number;
  profissionalNome: string;
  turnos: Turno[] | null;
}

export function ProfessionalScheduleDialog({
  expediente,
  onClose,
  onSaved,
  profissionalId,
  profissionalNome,
  turnos,
}: ProfessionalScheduleDialogProps) {
  const [saved] = useState(() =>
    turnos === null ? null : ordenarTurnos(turnos)
  );
  const [custom, setCustom] = useState<boolean>(saved !== null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSubmitting = useRef<boolean>(false);
  const clearError = useCallback(() => setError(null), []);
  const editor = useTurnosEditor(saved ?? expediente ?? [], clearError);
  const payload = custom ? editor.turnos : null;
  const hasChanges = !turnosIguais(saved, payload);
  const close = useFormClose(onClose, hasChanges, isSaving);

  const changeMode = useCallback(
    (value: string) => {
      setCustom(value === "personalizada");
      clearError();
    },
    [clearError]
  );

  const save = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting.current || !hasChanges) {
        return;
      }

      const validationError = payload === null ? null : validarTurnos(payload);
      if (validationError) {
        setError(validationError);
        return;
      }

      isSubmitting.current = true;
      setIsSaving(true);
      clearError();
      try {
        const response = await updateProfessionalSchedule(
          profissionalId,
          payload
        );
        onSaved(response.turnos);
      } catch (failure) {
        setError(getApiErrorMessage(failure, SAVE_ERROR_MESSAGE));
      } finally {
        isSubmitting.current = false;
        setIsSaving(false);
      }
    },
    [clearError, hasChanges, onSaved, payload, profissionalId]
  );

  return (
    <Dialog
      description={`Defina a jornada semanal de ${profissionalNome}.`}
      isOpen
      onClose={close}
      title="Configurar jornada"
    >
      <form noValidate onSubmit={save}>
        <fieldset className="flex min-w-0 flex-col gap-4" disabled={isSaving}>
          <SelectField
            label="Tipo de jornada"
            onChange={changeMode}
            options={OPTIONS}
            value={custom ? "personalizada" : "herdada"}
          />

          {custom ? (
            <>
              <p className="font-roboto text-sm text-zinc-400">
                A disponibilidade será limitada ao expediente da barbearia.
              </p>
              <WeeklyHoursEditor editor={editor} emptyDayLabel="Folga" />
            </>
          ) : null}
          {!custom && saved !== null ? (
            <p className="font-roboto text-sm text-zinc-400">
              Ao salvar, os turnos personalizados serão removidos.
            </p>
          ) : null}

          {error ? <FormAlert message={error} /> : null}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:opacity-60"
              onClick={close}
              type="button"
            >
              Cancelar
            </button>
            <button
              aria-busy={isSaving}
              className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!hasChanges || isSaving}
              type="submit"
            >
              {isSaving ? (
                <SpinnerIcon className="h-4 w-4 animate-spin" />
              ) : null}
              {isSaving ? "Salvando..." : "Salvar jornada"}
            </button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
