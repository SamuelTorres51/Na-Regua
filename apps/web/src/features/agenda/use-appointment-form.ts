import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  consultarDisponibilidade,
  criarAgendamento,
  listarProfissionaisDoServico,
} from "@/services/agenda";
import {
  getApiErrorMessage,
  HTTP_STATUS,
  hasApiStatus,
  isApiEnabled,
  isNetworkError,
} from "@/services/api-client";
import { listServicos } from "@/services/catalog";
import { listClientes } from "@/services/clients";
import type { Agendamento } from "./types";

interface QueryResult<T> {
  attempt: number;
  data: T | null;
  error: string | null;
  load: () => Promise<T>;
}

function useAppointmentQuery<T>(
  load: (() => Promise<T>) | null,
  message: string
) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<QueryResult<T> | null>(null);

  useEffect(() => {
    if (!load) {
      return;
    }

    let isActive = true;
    load()
      .then((data) => {
        if (isActive) {
          setResult({ attempt, data, error: null, load });
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({
            attempt,
            data: null,
            error: getApiErrorMessage(error, message),
            load,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [attempt, load, message]);

  const current =
    result?.load === load && result.attempt === attempt ? result : null;
  const retry = useCallback(() => setAttempt((previous) => previous + 1), []);

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    isLoading: load !== null && current === null,
    retry,
  };
}

async function loadCatalog() {
  const [clientes, servicos] = await Promise.all([
    listClientes(true),
    listServicos(),
  ]);
  return { clientes, servicos: servicos.filter(({ ativo }) => ativo) };
}

interface UseAppointmentFormOptions {
  initialDate: string;
  onClose: () => void;
  onCreated: (agendamento: Agendamento) => void;
}

export function useAppointmentForm({
  initialDate,
  onClose,
  onCreated,
}: UseAppointmentFormOptions) {
  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [data, setData] = useState(initialDate);
  const [horario, setHorario] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSubmitting = useRef<boolean>(false);

  const loadProfessionals = useCallback(
    () => listarProfissionaisDoServico(Number(servicoId)),
    [servicoId]
  );
  const loadAvailability = useCallback(
    () => consultarDisponibilidade(Number(profissionalId), Number(servicoId)),
    [profissionalId, servicoId]
  );

  const catalog = useAppointmentQuery(
    isApiEnabled ? loadCatalog : null,
    "Não foi possível carregar os clientes e serviços."
  );
  const professionals = useAppointmentQuery(
    servicoId ? loadProfessionals : null,
    "Não foi possível carregar os profissionais deste serviço."
  );
  const { retry: reloadAvailability, ...availability } = useAppointmentQuery(
    profissionalId ? loadAvailability : null,
    "Não foi possível consultar a disponibilidade."
  );

  const day = availability.data?.find((item) => item.data === data);
  const inicio = day?.horarios.find((slot) => slot === horario);
  const canSave = Boolean(clienteId && servicoId && profissionalId && inicio);

  const changeClient = useCallback((value: string) => {
    setClienteId(value);
    setSaveError(null);
  }, []);
  const changeService = useCallback((value: string) => {
    setServicoId(value);
    setProfissionalId("");
    setHorario("");
    setSaveError(null);
  }, []);
  const changeProfessional = useCallback((value: string) => {
    setProfissionalId(value);
    setHorario("");
    setSaveError(null);
  }, []);
  const changeDate = useCallback((value: string) => {
    setData(value);
    setHorario("");
    setSaveError(null);
  }, []);
  const changeTime = useCallback((value: string) => {
    setHorario(value);
    setSaveError(null);
  }, []);
  const close = useCallback(() => {
    if (!isSubmitting.current) {
      onClose();
    }
  }, [onClose]);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting.current || !canSave || !inicio) {
        return;
      }

      isSubmitting.current = true;
      setIsSaving(true);
      setSaveError(null);
      try {
        const agendamento = await criarAgendamento({
          clienteId: Number(clienteId),
          inicio,
          profissionalId: Number(profissionalId),
          servicoId: Number(servicoId),
        });
        onCreated(agendamento);
      } catch (failure) {
        setSaveError(
          getApiErrorMessage(
            failure,
            "Não foi possível criar o agendamento. Tente novamente."
          )
        );
        if (
          hasApiStatus(failure, HTTP_STATUS.conflict) ||
          hasApiStatus(failure, HTTP_STATUS.unprocessableEntity) ||
          isNetworkError(failure)
        ) {
          setHorario("");
          reloadAvailability();
        }
      } finally {
        isSubmitting.current = false;
        setIsSaving(false);
      }
    },
    [
      canSave,
      clienteId,
      inicio,
      onCreated,
      profissionalId,
      reloadAvailability,
      servicoId,
    ]
  );

  return {
    availability,
    canSave,
    catalog,
    changeClient,
    changeDate,
    changeProfessional,
    changeService,
    changeTime,
    clienteId,
    close,
    day,
    horario,
    isSaving,
    professionals,
    profissionalId,
    reloadAvailability,
    saveError,
    servicoId,
    submit,
  };
}
