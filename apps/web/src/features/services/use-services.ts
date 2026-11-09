import { useCallback, useEffect, useState } from "react";

import {
  createServico,
  deleteServico,
  listServicos,
  updateServico,
} from "@/services/catalog";
import type { Servico, ServicoInput } from "./types";

const LOAD_ERROR_MESSAGE = "Não foi possível carregar os serviços.";

function sortByName(servicos: Servico[]) {
  return [...servicos].sort((first, second) =>
    first.nome.localeCompare(second.nome, "pt-BR")
  );
}

export function useServices() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    listServicos()
      .then((lista) => {
        if (isActive) {
          setServicos(sortByName(lista));
        }
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

  const saveServico = useCallback(async (input: ServicoInput, id?: number) => {
    const saved =
      id === undefined
        ? await createServico(input)
        : await updateServico(id, input);

    setServicos((current) =>
      sortByName([...current.filter((item) => item.id !== saved.id), saved])
    );
  }, []);

  const removeServico = useCallback(async (id: number) => {
    await deleteServico(id);
    setServicos((current) => current.filter((item) => item.id !== id));
  }, []);

  return { error, isLoading, removeServico, saveServico, servicos };
}
