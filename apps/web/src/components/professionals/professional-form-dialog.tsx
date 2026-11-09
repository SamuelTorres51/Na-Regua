// biome-ignore-all lint/performance/noJsxPropsBind: form fields update their own keys
import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { SpinnerIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";
import type {
  NovoProfissionalInput,
  Profissional,
} from "@/features/professionals/types";
import { useProfessionalForm } from "@/features/professionals/use-professional-form";

interface ProfessionalFormDialogProps {
  onClose: () => void;
  onSave: (input: NovoProfissionalInput) => Promise<void>;
  profissional: Profissional | null;
}

export function ProfessionalFormDialog({
  onClose,
  onSave,
  profissional,
}: ProfessionalFormDialogProps) {
  const {
    errors,
    handleSubmit,
    isEditing,
    isSaving,
    setField,
    submitError,
    values,
  } = useProfessionalForm({ onSave, onSuccess: onClose, profissional });

  return (
    <Dialog
      description={
        isEditing
          ? `Atualize os dados de contato. O e-mail de acesso (${profissional?.email}) não pode ser alterado.`
          : "O profissional vai usar o e-mail e a senha cadastrados para entrar no painel."
      }
      isOpen
      onClose={onClose}
      title={isEditing ? "Editar profissional" : "Novo profissional"}
    >
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <TextField
          autoComplete="name"
          error={errors.nome}
          label="Nome completo"
          name="nome"
          onChange={(value) => setField("nome", value)}
          placeholder="Nome do profissional"
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

        {isEditing ? null : (
          <>
            <TextField
              autoComplete="off"
              error={errors.email}
              label="E-mail de acesso"
              name="email"
              onChange={(value) => setField("email", value)}
              placeholder="profissional@email.com"
              type="email"
              value={values.email}
            />
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
          </>
        )}

        {submitError ? <FormAlert message={submitError} /> : null}

        <div className="mt-2 flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
            onClick={onClose}
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
            Salvar profissional
          </button>
        </div>
      </form>
    </Dialog>
  );
}
