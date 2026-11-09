import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import { getApiErrorMessage } from "@/services/api-client";
import { formatPhone } from "@/utils/phone";
import type { NovoProfissionalInput, Profissional } from "./types";
import {
  type ProfessionalFormErrors,
  type ProfessionalFormValues,
  parseProfessionalForm,
  toProfessionalFormValues,
} from "./validation";

const SAVE_ERROR_MESSAGE =
  "Não foi possível salvar o profissional. Tente novamente.";

interface UseProfessionalFormOptions {
  onSave: (input: NovoProfissionalInput) => Promise<void>;
  onSuccess: () => void;
  profissional: Profissional | null;
}

export function useProfessionalForm({
  onSave,
  onSuccess,
  profissional,
}: UseProfessionalFormOptions) {
  const isEditing = profissional !== null;

  const [values, setValues] = useState(() =>
    toProfessionalFormValues(profissional)
  );
  const [errors, setErrors] = useState<ProfessionalFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setField = useCallback(
    (key: keyof ProfessionalFormValues, value: string) => {
      const nextValue = key === "telefone" ? formatPhone(value) : value;
      setValues((current) => ({ ...current, [key]: nextValue }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const { errors: nextErrors, input } = parseProfessionalForm(
        values,
        isEditing
      );
      setErrors(nextErrors);
      setSubmitError(null);

      if (!input) {
        return;
      }

      setIsSaving(true);

      try {
        await onSave(input);
        onSuccess();
      } catch (error) {
        setSubmitError(getApiErrorMessage(error, SAVE_ERROR_MESSAGE));
      } finally {
        setIsSaving(false);
      }
    },
    [isEditing, onSave, onSuccess, values]
  );

  return {
    errors,
    handleSubmit,
    isEditing,
    isSaving,
    setField,
    submitError,
    values,
  };
}
