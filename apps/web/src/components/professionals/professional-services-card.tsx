// biome-ignore-all lint/performance/noJsxPropsBind: each row removes its own service
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { ActiveBadge } from "@/components/ui/active-badge";
import { FormAlert } from "@/components/ui/form-alert";
import { PlusIcon, ScissorsIcon, SpinnerIcon } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/select-field";
import { useProfessionalServices } from "@/features/professionals/use-professional-services";
import type { Servico } from "@/features/services/types";
import { getApiErrorMessage } from "@/services/api-client";
import { formatCurrency } from "@/utils/currency";

const ADD_ERROR_MESSAGE =
  "Não foi possível vincular o serviço. Tente novamente.";
const REMOVE_ERROR_MESSAGE =
  "Não foi possível desvincular o serviço. Tente novamente.";

interface ProfessionalServicesCardProps {
  catalogError: string | null;
  catalogo: Servico[];
  isCatalogLoading: boolean;
  profissionalId: number;
}

function getUnavailableMessage(
  catalogo: Servico[],
  isCatalogLoading: boolean,
  catalogError: string | null
) {
  if (isCatalogLoading) {
    return "Carregando o catálogo de serviços...";
  }

  if (catalogError) {
    return catalogError;
  }

  return catalogo.some((servico) => servico.ativo)
    ? "Todos os serviços ativos do catálogo já estão vinculados."
    : "Não há serviços ativos no catálogo para vincular.";
}

export function ProfessionalServicesCard({
  catalogError,
  catalogo,
  isCatalogLoading,
  profissionalId,
}: ProfessionalServicesCardProps) {
  const { addServico, error, isLoading, removeServico, servicos } =
    useProfessionalServices(profissionalId);

  const [selectedServicoId, setSelectedServicoId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const availableServicos = useMemo(() => {
    const linkedIds = new Set(servicos.map((servico) => servico.id));

    return catalogo.filter(
      (servico) => servico.ativo && !linkedIds.has(servico.id)
    );
  }, [catalogo, servicos]);

  const options = useMemo(
    () => [
      { label: "Selecione um serviço", value: "" },
      ...availableServicos.map((servico) => ({
        label: `${servico.nome} · ${servico.duracaoMinutos} min`,
        value: String(servico.id),
      })),
    ],
    [availableServicos]
  );

  const handleAdd = useCallback(async () => {
    const servico = availableServicos.find(
      (item) => String(item.id) === selectedServicoId
    );

    if (!servico) {
      return;
    }

    setIsAdding(true);
    setActionError(null);

    try {
      await addServico(servico);
      setSelectedServicoId("");
    } catch (addFailure) {
      setActionError(getApiErrorMessage(addFailure, ADD_ERROR_MESSAGE));
    } finally {
      setIsAdding(false);
    }
  }, [addServico, availableServicos, selectedServicoId]);

  const handleRemove = useCallback(
    async (servicoId: number) => {
      setRemovingId(servicoId);
      setActionError(null);

      try {
        await removeServico(servicoId);
      } catch (removeFailure) {
        setActionError(getApiErrorMessage(removeFailure, REMOVE_ERROR_MESSAGE));
      } finally {
        setRemovingId(null);
      }
    },
    [removeServico]
  );

  let content: ReactNode = (
    <p className="rounded-2xl border border-zinc-800 border-dashed px-5 py-6 text-center font-roboto text-sm text-zinc-500">
      Nenhum serviço vinculado. Sem serviços, o profissional não aparece como
      opção nos agendamentos.
    </p>
  );

  if (isLoading) {
    content = (
      <div className="flex items-center gap-3 py-4 text-zinc-400" role="status">
        <SpinnerIcon className="h-4 w-4 animate-spin" />
        <span className="font-roboto text-sm">Carregando serviços...</span>
      </div>
    );
  } else if (error) {
    content = <FormAlert message={error} />;
  } else if (servicos.length > 0) {
    content = (
      <ul className="flex flex-col gap-2">
        {servicos.map((servico) => (
          <li
            className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/30 px-4 py-3"
            key={servico.id}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <ScissorsIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-roboto-medium text-sm text-white">
                  {servico.nome}
                </p>
                <p className="mt-0.5 font-roboto text-xs text-zinc-500">
                  {servico.duracaoMinutos} min · {formatCurrency(servico.preco)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {servico.ativo ? null : <ActiveBadge ativo={false} />}
              <button
                aria-label={`Desvincular ${servico.nome}`}
                className="rounded-lg px-3 py-2 font-roboto-medium text-xs text-zinc-400 transition hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
                disabled={removingId !== null}
                onClick={() => handleRemove(servico.id)}
                type="button"
              >
                {removingId === servico.id ? "Removendo..." : "Remover"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const canAdd = !(isLoading || error) && availableServicos.length > 0;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-roboto-semibold text-base text-white">
            Serviços que atende
          </h2>
          <p className="mt-1 font-roboto text-xs text-zinc-500">
            Nos agendamentos, o profissional só aparece para estes serviços.
          </p>
        </div>
        <ScissorsIcon className="h-5 w-5 shrink-0 text-zinc-500" />
      </div>

      <div className="mt-5">{content}</div>

      {actionError ? (
        <div className="mt-4">
          <FormAlert message={actionError} />
        </div>
      ) : null}

      {isLoading || error ? null : (
        <div className="mt-5 border-zinc-800 border-t pt-5">
          {canAdd ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <SelectField
                  label="Vincular serviço"
                  onChange={setSelectedServicoId}
                  options={options}
                  value={selectedServicoId}
                />
              </div>
              <button
                aria-busy={isAdding}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!selectedServicoId || isAdding}
                onClick={handleAdd}
                type="button"
              >
                {isAdding ? (
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
                Vincular
              </button>
            </div>
          ) : (
            <p className="font-roboto text-xs text-zinc-500">
              {getUnavailableMessage(catalogo, isCatalogLoading, catalogError)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
