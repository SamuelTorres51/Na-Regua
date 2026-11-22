import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api-client";
import {
  createCliente,
  listClientes,
  setClienteAtivo,
  updateCliente,
} from "@/services/clients";
import type { Cliente, NovoClienteInput } from "./types";

const LOAD_ERROR_MESSAGE = "Não foi possível carregar os clientes.";

interface ClientListResult {
  attempt: number;
  clientes: Cliente[];
  error: string | null;
}

function sortByName(clientes: Cliente[]) {
  return [...clientes].sort((first, second) =>
    first.nome.localeCompare(second.nome, "pt-BR")
  );
}

export function useClients() {
  const [result, setResult] = useState<ClientListResult | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;

    listClientes()
      .then((list) => {
        if (isActive) {
          setResult({
            attempt: loadAttempt,
            clientes: sortByName(list),
            error: null,
          });
        }
      })
      .catch((failure) => {
        if (isActive) {
          setResult({
            attempt: loadAttempt,
            clientes: [],
            error: getApiErrorMessage(failure, LOAD_ERROR_MESSAGE),
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [loadAttempt]);

  const reload = useCallback(() => {
    setLoadAttempt((current) => current + 1);
  }, []);

  const upsertCliente = useCallback((saved: Cliente) => {
    setResult(
      (current) =>
        current && {
          ...current,
          clientes: sortByName([
            ...current.clientes.filter(({ id }) => id !== saved.id),
            saved,
          ]),
        }
    );
  }, []);

  const saveCliente = useCallback(
    async (input: NovoClienteInput, id?: number) => {
      const { email, nome, telefone } = input;
      const saved =
        id === undefined
          ? await createCliente(input)
          : await updateCliente(id, { email, nome, telefone });

      upsertCliente(saved);
    },
    [upsertCliente]
  );

  const changeClienteAtivo = useCallback(
    async (id: number, ativo: boolean) => {
      const saved = await setClienteAtivo(id, ativo);
      upsertCliente(saved);
    },
    [upsertCliente]
  );

  const currentResult = result?.attempt === loadAttempt ? result : null;

  return {
    changeClienteAtivo,
    clientes: currentResult?.clientes ?? [],
    error: currentResult?.error ?? null,
    isLoading: currentResult === null,
    reload,
    saveCliente,
  };
}
