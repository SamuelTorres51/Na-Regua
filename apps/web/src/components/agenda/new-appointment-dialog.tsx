import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { SpinnerIcon } from "@/components/ui/icons";
import { SelectField, type SelectOption } from "@/components/ui/select-field";
import {
  formatFullDate,
  formatMinutes,
  getAgendaDate,
  minutesOfDay,
  parseIsoDate,
} from "@/features/agenda/date-utils";
import type { Agendamento, DiaDisponibilidade } from "@/features/agenda/types";
import { useAppointmentForm } from "@/features/agenda/use-appointment-form";

const DAY_STATUS_LABELS: Record<DiaDisponibilidade["status"], string> = {
  disponivel: "",
  fechado: "Barbearia fechada",
  folga: "Folga do profissional",
  lotado: "Sem horários",
};

function dateOption({ data, status }: DiaDisponibilidade): SelectOption {
  const date = parseIsoDate(data);
  const label = date ? formatFullDate(date) : data;
  const detail = DAY_STATUS_LABELS[status];

  return { label: detail ? `${label} · ${detail}` : label, value: data };
}

function timeOption(inicio: string): SelectOption {
  return {
    label: formatMinutes(minutesOfDay(getAgendaDate(new Date(inicio)))),
    value: inicio,
  };
}

function optionsWithPlaceholder(
  placeholder: string,
  options: SelectOption[]
): SelectOption[] {
  return [{ label: placeholder, value: "" }, ...options];
}

interface LoadErrorProps {
  error: string | null;
  onRetry: () => void;
}

function LoadError({ error, onRetry }: LoadErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <FormAlert message={error} />
      <button
        className="self-start rounded-lg border border-zinc-700 px-3 py-2 font-roboto-medium text-brand text-xs transition hover:border-brand"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}

interface AppointmentFieldsProps {
  form: ReturnType<typeof useAppointmentForm>;
}

function AppointmentFields({ form }: AppointmentFieldsProps) {
  const { availability, catalog, day, professionals } = form;
  const clients = catalog.data?.clientes ?? [];
  const services = catalog.data?.servicos ?? [];
  const assignedProfessionals = professionals.data ?? [];
  const days = availability.data ?? [];
  const times = day?.horarios ?? [];

  return (
    <>
      <SelectField
        disabled={clients.length === 0}
        label="Cliente"
        onChange={form.changeClient}
        options={optionsWithPlaceholder(
          catalog.isLoading ? "Carregando clientes..." : "Selecione um cliente",
          clients.map(({ email, id, nome }) => ({
            label: `${nome} · ${email}`,
            value: String(id),
          }))
        )}
        value={form.clienteId}
      />
      <SelectField
        disabled={services.length === 0}
        label="Serviço"
        onChange={form.changeService}
        options={optionsWithPlaceholder(
          catalog.isLoading ? "Carregando serviços..." : "Selecione um serviço",
          services.map(({ id, nome }) => ({ label: nome, value: String(id) }))
        )}
        value={form.servicoId}
      />
      <LoadError error={catalog.error} onRetry={catalog.retry} />
      {catalog.data && clients.length === 0 ? (
        <p className="font-roboto text-sm text-zinc-400">
          Nenhum cliente ativo cadastrado.
        </p>
      ) : null}
      {catalog.data && services.length === 0 ? (
        <p className="font-roboto text-sm text-zinc-400">
          Nenhum serviço ativo cadastrado.
        </p>
      ) : null}

      <SelectField
        disabled={assignedProfessionals.length === 0}
        label="Profissional"
        onChange={form.changeProfessional}
        options={optionsWithPlaceholder(
          professionals.isLoading
            ? "Carregando profissionais..."
            : "Selecione um profissional",
          assignedProfessionals.map(({ id, nome }) => ({
            label: nome,
            value: String(id),
          }))
        )}
        value={form.profissionalId}
      />
      <LoadError error={professionals.error} onRetry={professionals.retry} />
      {professionals.data && assignedProfessionals.length === 0 ? (
        <p className="font-roboto text-sm text-zinc-400">
          Nenhum profissional ativo oferece este serviço.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          disabled={days.length === 0}
          label="Data"
          onChange={form.changeDate}
          options={optionsWithPlaceholder(
            availability.isLoading
              ? "Consultando datas..."
              : "Selecione uma data",
            days.map(dateOption)
          )}
          value={day?.data ?? ""}
        />
        <SelectField
          disabled={times.length === 0}
          label="Horário"
          onChange={form.changeTime}
          options={optionsWithPlaceholder(
            day && times.length === 0
              ? "Sem horários nesta data"
              : "Selecione um horário",
            times.map(timeOption)
          )}
          value={form.horario}
        />
      </div>
      <LoadError error={availability.error} onRetry={form.reloadAvailability} />
      {availability.data && days.length === 0 ? (
        <p className="font-roboto text-sm text-zinc-400">
          Nenhuma data disponível.
        </p>
      ) : null}
    </>
  );
}

interface NewAppointmentDialogProps {
  initialDate: string;
  onClose: () => void;
  onCreated: (agendamento: Agendamento) => void;
}

export function NewAppointmentDialog(props: NewAppointmentDialogProps) {
  const form = useAppointmentForm(props);

  return (
    <Dialog
      description="Selecione o cliente, o serviço e um horário disponível para o atendimento."
      isOpen
      onClose={form.close}
      title="Novo agendamento"
    >
      <form onSubmit={form.submit}>
        <fieldset
          className="flex min-w-0 flex-col gap-5"
          disabled={form.isSaving}
        >
          <AppointmentFields form={form} />
          {form.saveError ? <FormAlert message={form.saveError} /> : null}

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="h-14 rounded-2xl border border-zinc-700 px-6 font-roboto-medium text-sm text-white transition-colors hover:border-zinc-600 disabled:opacity-60"
              onClick={form.close}
              type="button"
            >
              Cancelar
            </button>
            <button
              aria-busy={form.isSaving}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-6 font-roboto-semibold text-base text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-48"
              disabled={!form.canSave || form.isSaving}
              type="submit"
            >
              {form.isSaving ? (
                <SpinnerIcon className="h-5 w-5 animate-spin" />
              ) : null}
              {form.isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
