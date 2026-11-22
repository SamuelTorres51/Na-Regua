import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useId, useRef, useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { SpinnerIcon } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/select-field";
import {
  CANCELLATION_DEADLINE_MESSAGE,
  listarAcoesDeStatus,
  MAX_REASON_LENGTH,
  podeCancelarAgendamento,
  temStatusCancelavel,
  validarMotivoCancelamento,
} from "@/features/agenda/appointment-actions";
import {
  formatFullDate,
  formatMinutes,
  getAgendaDate,
  minutesOfDay,
} from "@/features/agenda/date-utils";
import type { Agendamento } from "@/features/agenda/types";
import {
  atualizarStatusAgendamento,
  cancelarAgendamento,
} from "@/services/agenda";
import {
  getApiErrorMessage,
  HTTP_STATUS,
  hasApiStatus,
} from "@/services/api-client";
import { StatusBadge } from "./status-badge";

const CANCEL_ACTION = {
  label: "Cancelar agendamento",
  value: "cancelar",
} as const;

interface CancellationReasonProps {
  error: string | null;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  value: string;
}

function CancellationReason({
  error,
  onChange,
  value,
}: CancellationReasonProps) {
  const fieldId = useId();
  const hintId = `${fieldId}-hint`;

  return (
    <div className="flex flex-col gap-2">
      <label
        className="font-roboto-medium text-sm text-zinc-400"
        htmlFor={fieldId}
      >
        Motivo do cancelamento
      </label>
      <textarea
        aria-describedby={hintId}
        aria-invalid={error !== null}
        className={`min-h-24 w-full rounded-xl border bg-zinc-900/60 px-3 py-2 font-roboto text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand ${error ? "border-danger" : "border-zinc-700"}`}
        id={fieldId}
        onChange={onChange}
        placeholder="Informe o motivo"
        required
        value={value}
      />
      <p
        className={`font-roboto text-xs ${error ? "text-danger" : "text-zinc-500"}`}
        id={hintId}
        role={error ? "alert" : undefined}
      >
        {error ?? `Até ${MAX_REASON_LENGTH} caracteres.`}
      </p>
    </div>
  );
}

interface ManageAppointmentDialogProps {
  agendamento: Agendamento;
  onClose: () => void;
  onFinish: (message: string, type: "error" | "success") => void;
}

export function ManageAppointmentDialog({
  agendamento,
  onClose,
  onFinish,
}: ManageAppointmentDialogProps) {
  const [selection, setSelection] = useState("");
  const [motivo, setMotivo] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSubmitting = useRef<boolean>(false);

  const { id, inicio, status } = agendamento;
  const canCancel = podeCancelarAgendamento(agendamento);
  const statusActions = listarAcoesDeStatus(status);
  const actions = canCancel ? [...statusActions, CANCEL_ACTION] : statusActions;
  const selected = actions.find(({ value }) => value === selection);
  const wantsCancellation = selected?.value === "cancelar";
  const closedForCancellation = temStatusCancelavel(status) && !canCancel;

  const date = getAgendaDate(new Date(inicio));
  const appointmentTime = `${formatFullDate(date)} às ${formatMinutes(minutesOfDay(date))}`;
  const cliente = agendamento.cliente?.nome ?? "Cliente não identificado";
  const details = [agendamento.servico?.nome, agendamento.profissional?.nome]
    .filter(Boolean)
    .join(" · ");

  const changeSelection = useCallback((value: string) => {
    setSelection(value);
    setError(null);
    setReasonError(null);
  }, []);

  const changeReason = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setMotivo(event.target.value);
      setError(null);
      setReasonError(null);
    },
    []
  );

  const close = useCallback(() => {
    if (!isSubmitting.current) {
      onClose();
    }
  }, [onClose]);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting.current || !selected) {
        return;
      }

      const action = selected.value;
      if (action === "cancelar") {
        if (!podeCancelarAgendamento(agendamento)) {
          setSelection("");
          return;
        }
        const validationError = validarMotivoCancelamento(motivo);
        if (validationError) {
          setReasonError(validationError);
          return;
        }
      }

      isSubmitting.current = true;
      setIsSaving(true);
      setError(null);
      try {
        if (action === "cancelar") {
          await cancelarAgendamento(id, motivo.trim());
          onFinish("Agendamento cancelado com sucesso.", "success");
        } else {
          await atualizarStatusAgendamento(id, action);
          onFinish("Status do agendamento atualizado.", "success");
        }
      } catch (failure) {
        const message = getApiErrorMessage(
          failure,
          "Não foi possível realizar a ação. Tente novamente."
        );
        if (
          hasApiStatus(failure, HTTP_STATUS.conflict) ||
          hasApiStatus(failure, HTTP_STATUS.notFound)
        ) {
          onFinish(message, "error");
        } else {
          setError(message);
        }
      } finally {
        isSubmitting.current = false;
        setIsSaving(false);
      }
    },
    [agendamento, id, motivo, onFinish, selected]
  );

  return (
    <Dialog
      description={`${cliente} · ${appointmentTime}`}
      isOpen
      onClose={close}
      title="Gerenciar agendamento"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {details ? (
          <p className="font-roboto text-sm text-zinc-400">{details}</p>
        ) : null}
        <StatusBadge status={status} />
      </div>

      <form noValidate onSubmit={submit}>
        <fieldset className="flex min-w-0 flex-col gap-4" disabled={isSaving}>
          <SelectField
            label="Ação"
            onChange={changeSelection}
            options={[{ label: "Selecione uma ação", value: "" }, ...actions]}
            value={selected?.value ?? ""}
          />

          {closedForCancellation ? (
            <p className="font-roboto text-sm text-zinc-400">
              {CANCELLATION_DEADLINE_MESSAGE}
            </p>
          ) : null}

          {wantsCancellation ? (
            <CancellationReason
              error={reasonError}
              onChange={changeReason}
              value={motivo}
            />
          ) : null}
          {error ? <FormAlert message={error} /> : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:opacity-60"
              onClick={close}
              type="button"
            >
              Fechar
            </button>
            <button
              aria-busy={isSaving}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl px-5 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${wantsCancellation ? "bg-danger" : "bg-brand"}`}
              disabled={!selected || isSaving}
              type="submit"
            >
              {isSaving ? (
                <SpinnerIcon className="h-4 w-4 animate-spin" />
              ) : null}
              {selected?.label ?? "Aplicar ação"}
            </button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
