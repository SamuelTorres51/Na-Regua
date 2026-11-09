// biome-ignore-all lint/performance/noJsxPropsBind: form fields update their own keys
import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { SpinnerIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";
import type { Servico, ServicoInput } from "@/features/services/types";
import { useServiceForm } from "@/features/services/use-service-form";

interface ServiceFormDialogProps {
  onClose: () => void;
  onSave: (input: ServicoInput) => Promise<void>;
  servico: Servico | null;
}

export function ServiceFormDialog({
  onClose,
  onSave,
  servico,
}: ServiceFormDialogProps) {
  const { errors, handleSubmit, isSaving, setField, submitError, values } =
    useServiceForm({ onSave, onSuccess: onClose, servico });

  return (
    <Dialog
      description={
        servico
          ? "Atualize as informações do serviço."
          : "Cadastre um novo serviço no catálogo."
      }
      isOpen
      onClose={onClose}
      title={servico ? "Editar serviço" : "Novo serviço"}
    >
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <TextField
          autoComplete="off"
          error={errors.nome}
          label="Nome do serviço"
          name="nome"
          onChange={(value) => setField("nome", value)}
          placeholder="Ex.: Corte degradê"
          value={values.nome}
        />
        <TextField
          autoComplete="off"
          error={errors.descricao}
          label="Descrição (opcional)"
          name="descricao"
          onChange={(value) => setField("descricao", value)}
          placeholder="Ex.: Corte com acabamento na máquina e na tesoura"
          value={values.descricao}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            autoComplete="off"
            error={errors.duracao}
            inputMode="numeric"
            label="Duração (minutos)"
            name="duracao"
            onChange={(value) => setField("duracao", value)}
            placeholder="Ex.: 45"
            value={values.duracao}
          />
          <TextField
            autoComplete="off"
            error={errors.preco}
            inputMode="decimal"
            label="Preço (R$)"
            name="preco"
            onChange={(value) => setField("preco", value)}
            placeholder="Ex.: 35,00"
            value={values.preco}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 font-roboto text-sm text-zinc-300">
          <input
            checked={values.ativo}
            className="h-4 w-4 accent-brand"
            name="ativo"
            onChange={(event) => setField("ativo", event.target.checked)}
            type="checkbox"
          />
          Disponível para novos agendamentos
        </label>

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
            Salvar serviço
          </button>
        </div>
      </form>
    </Dialog>
  );
}
