// biome-ignore-all lint/performance/noJsxPropsBind: each input updates its field
import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";

import { TextField } from "@/components/ui/text-field";
import {
  getProfileChanges,
  type ProfileErrors,
  toProfileValues,
  validateProfileChanges,
} from "@/features/auth/account-validation";
import type {
  AtualizarPerfilInput,
  DadosPerfil,
  Usuario,
} from "@/features/auth/types";
import { useUnsavedChanges } from "@/features/unsaved-changes";
import {
  getApiErrorMessage,
  HTTP_STATUS,
  hasApiStatus,
} from "@/services/api-client";
import { type AccountFeedback, AccountFormCard } from "./account-form-card";

interface ProfileFormProps {
  isBusy: boolean;
  onSave: (input: AtualizarPerfilInput) => Promise<Usuario>;
  usuario: Usuario;
}

export function ProfileForm({ isBusy, onSave, usuario }: ProfileFormProps) {
  const [values, setValues] = useState(() => toProfileValues(usuario));
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [feedback, setFeedback] = useState<AccountFeedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const changes = useMemo(
    () => getProfileChanges(values, usuario),
    [values, usuario]
  );
  const hasChanges = Object.keys(changes).length > 0;
  useUnsavedChanges(hasChanges, isSaving);

  const change = useCallback((field: keyof DadosPerfil, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
  }, []);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isBusy || isSaving || !hasChanges) {
        return;
      }

      const validationErrors = validateProfileChanges(changes);
      setErrors(validationErrors);
      setFeedback(null);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSaving(true);
      try {
        const updated = await onSave(changes);
        setValues(toProfileValues(updated));
        setFeedback({
          message: "Perfil atualizado com sucesso.",
          type: "success",
        });
      } catch (failure) {
        const message = getApiErrorMessage(
          failure,
          "Não foi possível atualizar o perfil."
        );
        if (
          hasApiStatus(failure, HTTP_STATUS.conflict) &&
          changes.email !== undefined
        ) {
          setErrors({ email: message });
        } else {
          setFeedback({ message, type: "error" });
        }
      } finally {
        setIsSaving(false);
      }
    },
    [changes, hasChanges, isBusy, isSaving, onSave]
  );

  return (
    <AccountFormCard
      feedback={feedback}
      isBusy={isBusy}
      isSaving={isSaving}
      onSubmit={submit}
      submitDisabled={!hasChanges}
      submitLabel="Salvar perfil"
      title="Dados pessoais"
    >
      <TextField
        autoComplete="name"
        error={errors.nome}
        label="Nome completo"
        name="nome"
        onChange={(value) => change("nome", value)}
        placeholder="Seu nome"
        value={values.nome}
      />
      <TextField
        autoComplete="email"
        error={errors.email}
        label="E-mail"
        name="email"
        onChange={(value) => change("email", value)}
        placeholder="seuemail@exemplo.com"
        type="email"
        value={values.email}
      />
      <TextField
        autoComplete="tel"
        error={errors.telefone}
        inputMode="tel"
        label="Telefone"
        name="telefone"
        onChange={(value) => change("telefone", value)}
        placeholder="(00) 00000-0000"
        value={values.telefone}
      />
    </AccountFormCard>
  );
}
