import { useCallback, useEffect, useMemo, useState } from "react";

import { useSession } from "@/features/auth/session-provider";
import { type AgendaQuery, listarAgendamentos } from "@/services/agenda";
import { getApiErrorMessage } from "@/services/api-client";
import { listServicos } from "@/services/catalog";
import { listProfissionais } from "@/services/professionals";
import { podeGerenciarAgendamento } from "./appointment-actions";
import {
  addDays,
  addMonths,
  getAgendaDate,
  getAgendaPeriod,
} from "./date-utils";
import type {
  AgendaFilters,
  Agendamento,
  AgendaView,
  ReferenciaAgenda,
} from "./types";

const EMPTY_FILTERS: AgendaFilters = {
  profissionalId: "",
  servicoId: "",
  status: "",
};

const LOAD_ERROR_MESSAGE = "Não foi possível carregar a agenda.";
const AGENDA_VIEW_STORAGE_PREFIX = "naregua.agenda.view.";

function loadPreferredView(storageKey: string | null): AgendaView {
  if (storageKey === null) {
    return "dia";
  }

  try {
    const storedView = localStorage.getItem(storageKey);
    if (
      storedView === "dia" ||
      storedView === "semana" ||
      storedView === "mes"
    ) {
      return storedView;
    }
  } catch {
    // A agenda funciona com a visualização padrão se o navegador bloquear o armazenamento.
  }

  return "dia";
}

interface AgendaResult {
  agendamentos: Agendamento[];
  error: string | null;
  query: AgendaQuery;
  revision: number;
}

interface CatalogResult {
  error: string | null;
  profissionais: ReferenciaAgenda[];
  servicos: ReferenciaAgenda[];
}

export function useAgenda() {
  const { session } = useSession();
  const usuario = session?.usuario;
  const profissional = usuario?.perfil === "profissional" ? usuario : null;
  const viewStorageKey = usuario
    ? `${AGENDA_VIEW_STORAGE_PREFIX}${usuario.id}`
    : null;

  const [view, setView] = useState(() => loadPreferredView(viewStorageKey));
  const [referenceDate, setReferenceDate] = useState(() => getAgendaDate());
  const [filters, setFilters] = useState<AgendaFilters>(EMPTY_FILTERS);
  const [catalog, setCatalog] = useState<CatalogResult | null>(null);
  const [result, setResult] = useState<AgendaResult | null>(null);
  const [revision, setRevision] = useState(0);

  const { fim, inicio } = getAgendaPeriod(referenceDate, view);
  const { profissionalId, servicoId, status } = filters;
  const query = useMemo(
    () => ({ fim, inicio, profissionalId, status }),
    [fim, inicio, profissionalId, status]
  );

  useEffect(() => {
    let isActive = true;

    Promise.all([
      profissional ? Promise.resolve([profissional]) : listProfissionais(),
      listServicos(),
    ])
      .then(([profissionais, servicos]) => {
        if (isActive) {
          setCatalog({ error: null, profissionais, servicos });
        }
      })
      .catch((error) => {
        if (isActive) {
          setCatalog({
            error: getApiErrorMessage(
              error,
              "Não foi possível carregar os filtros da agenda."
            ),
            profissionais: [],
            servicos: [],
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [profissional]);

  useEffect(() => {
    let isActive = true;

    listarAgendamentos(query)
      .then((items) => {
        if (isActive) {
          setResult({ agendamentos: items, error: null, query, revision });
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({
            agendamentos: [],
            error: getApiErrorMessage(error, LOAD_ERROR_MESSAGE),
            query,
            revision,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [query, revision]);

  const currentResult =
    result?.query === query && result.revision === revision ? result : null;
  const agendamentos = currentResult?.agendamentos ?? [];
  const selectedServicoId = Number(servicoId);
  const filteredAgendamentos = servicoId
    ? agendamentos.filter(({ servico }) => servico?.id === selectedServicoId)
    : agendamentos;

  const setFilter = useCallback(
    <Key extends keyof AgendaFilters>(key: Key, value: AgendaFilters[Key]) => {
      setFilters((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);
  const refresh = useCallback(() => setRevision((current) => current + 1), []);
  const canManageAppointment = useCallback(
    (agendamento: Agendamento) =>
      podeGerenciarAgendamento(agendamento, usuario),
    [usuario]
  );

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

  const goToToday = useCallback(() => setReferenceDate(getAgendaDate()), []);

  const setPreferredView = useCallback(
    (nextView: AgendaView) => {
      setView(nextView);
      if (viewStorageKey === null) {
        return;
      }

      try {
        localStorage.setItem(viewStorageKey, nextView);
      } catch {
        // A visualização já foi atualizada nesta visita.
      }
    },
    [viewStorageKey]
  );

  const selectDate = useCallback((date: Date) => {
    setReferenceDate(date);
    setView("dia");
  }, []);

  return {
    agendamentos: filteredAgendamentos,
    canCreateAppointment: usuario?.perfil === "administrador",
    canManageAppointment,
    clearFilters,
    error: currentResult?.error ?? catalog?.error ?? null,
    filters,
    goToNext,
    goToPrevious,
    goToToday,
    isLoading: !(currentResult && catalog),
    profissionais: catalog?.profissionais ?? [],
    profissional,
    referenceDate,
    refresh,
    selectDate,
    servicos: catalog?.servicos ?? [],
    setFilter,
    setPreferredView,
    setReferenceDate,
    view,
  };
}
