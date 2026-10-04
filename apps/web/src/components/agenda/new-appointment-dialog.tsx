import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { toIsoDate } from "@/features/agenda/date-utils";
import type { Profissional, Servico } from "@/features/agenda/types";

interface NewAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profissionais: Profissional[];
  servicos: Servico[];
}

export function NewAppointmentDialog({
  isOpen,
  onClose,
  profissionais,
  servicos,
}: NewAppointmentDialogProps) {
  const [cliente, setCliente] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [data, setData] = useState(() => toIsoDate(new Date()));
  const [hora, setHora] = useState("09:00");

  const servicoOptions = useMemo(
    () => [
      { label: "Selecione um serviço", value: "" },
      ...servicos.map((item) => ({ label: item.nome, value: item.id })),
    ],
    [servicos]
  );

  const profissionalOptions = useMemo(
    () => [
      { label: "Selecione um profissional", value: "" },
      ...profissionais.map((item) => ({ label: item.nome, value: item.id })),
    ],
    [profissionais]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // PROVISÓRIO: persistir o agendamento quando a rota da API existir.
      onClose();
    },
    [onClose]
  );

  return (
    <Dialog
      description="Preencha os dados do atendimento. A gravação será habilitada quando a integração com a API estiver pronta."
      isOpen={isOpen}
      onClose={onClose}
      title="Novo agendamento"
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <TextField
          autoComplete="off"
          label="Cliente"
          name="cliente"
          onChange={setCliente}
          placeholder="Nome do cliente"
          value={cliente}
        />

        <SelectField
          label="Serviço"
          onChange={setServicoId}
          options={servicoOptions}
          value={servicoId}
        />

        <SelectField
          label="Profissional"
          onChange={setProfissionalId}
          options={profissionalOptions}
          value={profissionalId}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            autoComplete="off"
            label="Data"
            name="data"
            onChange={setData}
            placeholder=""
            type="date"
            value={data}
          />
          <TextField
            autoComplete="off"
            label="Hora"
            name="hora"
            onChange={setHora}
            placeholder=""
            type="time"
            value={hora}
          />
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-14 rounded-2xl border border-zinc-700 px-6 font-roboto-medium text-sm text-white transition-colors hover:border-zinc-600"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <div className="sm:w-48">
            <PrimaryButton label="Salvar" />
          </div>
        </div>
      </form>
    </Dialog>
  );
}
