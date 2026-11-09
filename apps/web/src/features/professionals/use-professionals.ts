import { useCallback, useEffect, useState } from "react";

import {
  createProfissional,
  listProfissionais,
  setProfissionalAtivo,
  updateProfissional,
} from "@/services/professionals";
import type { NovoProfissionalInput, Profissional } from "./types";

const LOAD_ERROR_MESSAGE = "Não foi possível carregar os profissionais.";

function sortByName(profissionais: Profissional[]) {
  return [...profissionais].sort((first, second) =>
    first.nome.localeCompare(second.nome, "pt-BR")
  );
}

function replaceItem(profissionais: Profissional[], saved: Profissional) {
  return sortByName([
    ...profissionais.filter((item) => item.id !== saved.id),
    saved,
  ]);
}

export function useProfessionals() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    listProfissionais()
      .then((lista) => {
        if (isActive) {
          setProfissionais(sortByName(lista));
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

  const saveProfissional = useCallback(
    async (input: NovoProfissionalInput, id?: number) => {
      const saved =
        id === undefined
          ? await createProfissional(input)
          : await updateProfissional(id, {
              nome: input.nome,
              telefone: input.telefone,
            });

      setProfissionais((current) => replaceItem(current, saved));
      return saved;
    },
    []
  );

  const changeProfissionalAtivo = useCallback(
    async (id: number, ativo: boolean) => {
      const saved = await setProfissionalAtivo(id, ativo);
      setProfissionais((current) => replaceItem(current, saved));
    },
    []
  );

  return {
    changeProfissionalAtivo,
    error,
    isLoading,
    profissionais,
    saveProfissional,
  };
}
