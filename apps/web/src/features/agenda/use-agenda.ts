import { useCallback, useEffect, useMemo, useState } from "react";

import {
  listarAgendamentos,
  listarProfissionais,
  listarServicos,
} from "@/services/agenda";
import { addDays, addMonths } from "./date-utils";
import type {
  AgendaFilters,
  Agendamento,
  AgendaView,
  Profissional,
  Servico,
} from "./types";

const EMPTY_FILTERS: AgendaFilters = {
  profissionalId: "",
  servicoId: "",
  status: "",
};

const LOAD_ERROR_MESSAGE = "Não foi possível carregar a agenda.";

export function useAgenda() {
  const [view, setView] = useState<AgendaView>("dia");
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [filters, setFilters] = useState<AgendaFilters>(EMPTY_FILTERS);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    Promise.all([listarAgendamentos(), listarProfissionais(), listarServicos()])
      .then(([agenda, listaProfissionais, listaServicos]) => {
        if (!isActive) {
          return;
        }

        setAgendamentos(agenda);
        setProfissionais(listaProfissionais);
        setServicos(listaServicos);
      })
      .catch(() => {
        if (isActive) {
          setError(LOAD_ERROR_MESSAGE);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredAgendamentos = useMemo(
    () =>
      agendamentos.filter((agendamento) => {
        if (
          filters.profissionalId &&
          agendamento.profissionalId !== filters.profissionalId
        ) {
          return false;
        }

        if (filters.servicoId && agendamento.servicoId !== filters.servicoId) {
          return false;
        }

        if (filters.status && agendamento.status !== filters.status) {
          return false;
        }

        return true;
      }),
    [agendamentos, filters]
  );

  const setFilter = useCallback(
    <Key extends keyof AgendaFilters>(key: Key, value: AgendaFilters[Key]) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const goToPrevious = useCallback(() => {
    setReferenceDate((current) => {
      if (view === "semana") {
        return addDays(current, -7);
      }

      return view === "mes" ? addMonths(current, -1) : addDays(current, -1);
    });
  }, [view]);

  const goToNext = useCallback(() => {
    setReferenceDate((current) => {
      if (view === "semana") {
        return addDays(current, 7);
      }

      return view === "mes" ? addMonths(current, 1) : addDays(current, 1);
    });
  }, [view]);

  const goToToday = useCallback(() => setReferenceDate(new Date()), []);

  const selectDate = useCallback((date: Date) => {
    setReferenceDate(date);
    setView("dia");
  }, []);

  return {
    agendamentos: filteredAgendamentos,
    clearFilters,
    error,
    filters,
    goToNext,
    goToPrevious,
    goToToday,
    isLoading,
    profissionais,
    referenceDate,
    selectDate,
    servicos,
    setFilter,
    setReferenceDate,
    setView,
    view,
  };
}
