import { useCallback, useEffect, useState } from "react";

import type { Servico } from "@/features/services/types";
import {
  associarServico,
  desassociarServico,
  listServicosDoProfissional,
} from "@/services/professionals";

const LOAD_ERROR_MESSAGE =
  "Não foi possível carregar os serviços deste profissional.";

function sortByName(servicos: Servico[]) {
  return [...servicos].sort((first, second) =>
    first.nome.localeCompare(second.nome, "pt-BR")
  );
}

// Use com `key={profissionalId}` no componente para que a troca de
// profissional descarte o estado e as respostas pendentes do anterior.
export function useProfessionalServices(profissionalId: number) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    listServicosDoProfissional(profissionalId)
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
  }, [profissionalId]);

  const addServico = useCallback(
    async (servico: Servico) => {
      await associarServico(profissionalId, servico.id);
      setServicos((current) => sortByName([...current, servico]));
    },
    [profissionalId]
  );

  const removeServico = useCallback(
    async (servicoId: number) => {
      await desassociarServico(profissionalId, servicoId);
      setServicos((current) =>
        current.filter((servico) => servico.id !== servicoId)
      );
    },
    [profissionalId]
  );

  return { addServico, error, isLoading, removeServico, servicos };
}
