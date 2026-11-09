import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import { getApiErrorMessage } from "@/services/api-client";
import type { Servico, ServicoInput } from "./types";
import {
  parseServiceForm,
  type ServiceFormErrors,
  type ServiceFormValues,
  toServiceFormValues,
} from "./validation";

const SAVE_ERROR_MESSAGE =
  "Não foi possível salvar o serviço. Tente novamente.";

interface UseServiceFormOptions {
  onSave: (input: ServicoInput) => Promise<void>;
  onSuccess: () => void;
  servico: Servico | null;
}

export function useServiceForm({
  onSave,
  onSuccess,
  servico,
}: UseServiceFormOptions) {
  const [values, setValues] = useState(() => toServiceFormValues(servico));
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setField = useCallback(
    <Key extends keyof ServiceFormValues>(
      key: Key,
      value: ServiceFormValues[Key]
    ) => setValues((current) => ({ ...current, [key]: value })),
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const { errors: nextErrors, input } = parseServiceForm(values);
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
    [onSave, onSuccess, values]
  );

  return { errors, handleSubmit, isSaving, setField, submitError, values };
}
