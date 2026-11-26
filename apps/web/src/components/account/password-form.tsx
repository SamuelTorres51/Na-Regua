// biome-ignore-all lint/performance/noJsxPropsBind: each input updates its field
import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import { TextField } from "@/components/ui/text-field";
import {
  type PasswordErrors,
  type PasswordValues,
  validatePasswordChange,
} from "@/features/auth/account-validation";
import type { AlterarSenhaInput } from "@/features/auth/types";
import { useUnsavedChanges } from "@/features/unsaved-changes";
import {
  getApiErrorMessage,
  HTTP_STATUS,
  hasApiStatus,
} from "@/services/api-client";
import { type AccountFeedback, AccountFormCard } from "./account-form-card";

const EMPTY_FORM: PasswordValues = {
  confirmacao: "",
  novaSenha: "",
  senhaAtual: "",
};

interface PasswordFormProps {
  isBusy: boolean;
  onSave: (input: AlterarSenhaInput) => Promise<string>;
}

export function PasswordForm({ isBusy, onSave }: PasswordFormProps) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [feedback, setFeedback] = useState<AccountFeedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  useUnsavedChanges(Object.values(values).some(Boolean), isSaving);

  const change = useCallback((field: keyof PasswordValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
  }, []);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isBusy || isSaving) {
        return;
      }

      const validationErrors = validatePasswordChange(values);
      setErrors(validationErrors);
      setFeedback(null);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSaving(true);
      try {
        const { novaSenha, senhaAtual } = values;
        const message = await onSave({ novaSenha, senhaAtual });
        setValues(EMPTY_FORM);
        setResetCount((previous) => previous + 1);
        setFeedback({ message, type: "success" });
      } catch (failure) {
        const message = getApiErrorMessage(
          failure,
          "Não foi possível alterar a senha."
        );
        if (hasApiStatus(failure, HTTP_STATUS.badRequest)) {
          setErrors({ senhaAtual: message });
        } else {
          setFeedback({ message, type: "error" });
        }
      } finally {
        setIsSaving(false);
      }
    },
    [isBusy, isSaving, onSave, values]
  );

  return (
    <AccountFormCard
      feedback={feedback}
      isBusy={isBusy}
      isSaving={isSaving}
      onSubmit={submit}
      submitLabel="Alterar senha"
      title="Senha"
    >
      <div className="flex flex-col gap-4" key={resetCount}>
        <TextField
          autoComplete="current-password"
          error={errors.senhaAtual}
          label="Senha atual"
          name="senha_atual"
          onChange={(value) => change("senhaAtual", value)}
          placeholder="Informe sua senha atual"
          type="password"
          value={values.senhaAtual}
        />
        <TextField
          autoComplete="new-password"
          error={errors.novaSenha}
          label="Nova senha"
          name="nova_senha"
          onChange={(value) => change("novaSenha", value)}
          placeholder="Digite uma nova senha"
          type="password"
          value={values.novaSenha}
        />
        <TextField
          autoComplete="new-password"
          error={errors.confirmacao}
          label="Confirmar nova senha"
          name="confirmacao"
          onChange={(value) => change("confirmacao", value)}
          placeholder="Repita a nova senha"
          type="password"
          value={values.confirmacao}
        />
      </div>
    </AccountFormCard>
  );
}
