// biome-ignore-all lint/performance/noJsxPropsBind: each field updates its own key
import type { FormEvent } from "react";
import { useCallback, useRef, useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { SpinnerIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";
import type { Cliente, NovoClienteInput } from "@/features/clients/types";
import {
  type ClientFormErrors,
  parseClientForm,
  toClientFormValues,
} from "@/features/clients/validation";
import { getApiErrorMessage } from "@/services/api-client";

interface ClientFormDialogProps {
  cliente: Cliente | null;
  onClose: () => void;
  onSave: (input: NovoClienteInput, id?: number) => Promise<void>;
}

export function ClientFormDialog({
  cliente,
  onClose,
  onSave,
}: ClientFormDialogProps) {
  const isEditing = cliente !== null;
  const [values, setValues] = useState(() => toClientFormValues(cliente));
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSubmitting = useRef<boolean>(false);

  const setField = useCallback(
    (field: keyof NovoClienteInput, value: string) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    []
  );

  const close = useCallback(() => {
    if (!isSubmitting.current) {
      onClose();
    }
  }, [onClose]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting.current) {
        return;
      }

      const { errors: nextErrors, input } = parseClientForm(values, isEditing);
      setErrors(nextErrors);
      setSubmitError(null);
      if (!input) {
        return;
      }

      isSubmitting.current = true;
      setIsSaving(true);
      try {
        await onSave(input, cliente?.id);
        onClose();
      } catch (error) {
        setSubmitError(
          getApiErrorMessage(
            error,
            "Não foi possível salvar o cliente. Tente novamente."
          )
        );
      } finally {
        isSubmitting.current = false;
        setIsSaving(false);
      }
    },
    [cliente?.id, isEditing, onClose, onSave, values]
  );

  return (
    <Dialog
      description={
        isEditing
          ? "Atualize os dados do cliente."
          : "Preencha os dados para cadastrar um cliente."
      }
      isOpen
      onClose={close}
      title={isEditing ? "Editar cliente" : "Novo cliente"}
    >
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <fieldset className="flex min-w-0 flex-col gap-4" disabled={isSaving}>
          <TextField
            autoComplete="name"
            error={errors.nome}
            label="Nome completo"
            name="nome"
            onChange={(value) => setField("nome", value)}
            placeholder="Nome do cliente"
            value={values.nome}
          />
          <TextField
            autoComplete="tel"
            error={errors.telefone}
            inputMode="tel"
            label="Telefone"
            name="telefone"
            onChange={(value) => setField("telefone", value)}
            placeholder="(00) 00000-0000"
            value={values.telefone}
          />
          <TextField
            autoComplete="off"
            error={errors.email}
            label="E-mail"
            name="email"
            onChange={(value) => setField("email", value)}
            placeholder="cliente@email.com"
            type="email"
            value={values.email}
          />
          {isEditing ? null : (
            <TextField
              autoComplete="new-password"
              error={errors.senha}
              label="Senha inicial"
              name="senha"
              onChange={(value) => setField("senha", value)}
              placeholder="••••••••"
              type="password"
              value={values.senha}
            />
          )}
        </fieldset>

        {submitError ? <FormAlert message={submitError} /> : null}

        <div className="mt-2 flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={close}
            type="button"
          >
            Cancelar
          </button>
          <button
            aria-busy={isSaving}
            className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : null}
            Salvar cliente
          </button>
        </div>
      </form>
    </Dialog>
  );
}
