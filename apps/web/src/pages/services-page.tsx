// biome-ignore-all lint/performance/noJsxPropsBind: service rows and dialogs depend on local item state
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { ActiveBadge } from "@/components/ui/active-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  PlusIcon,
  ScissorsIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { ErrorPanel, LoadingPanel } from "@/components/ui/state-panels";
import type { Servico, ServicoInput } from "@/features/services/types";
import { useServices } from "@/features/services/use-services";
import { getApiErrorMessage } from "@/services/api-client";
import { formatCurrency } from "@/utils/currency";

type StatusFilter = "ativos" | "inativos" | "todos";

const DELETE_ERROR_MESSAGE =
  "Não foi possível excluir o serviço. Se ele já tiver agendamentos, edite-o e desmarque a opção de disponível para novos agendamentos.";

function matchesStatus({ ativo }: Servico, filter: StatusFilter) {
  if (filter === "ativos") {
    return ativo;
  }

  return filter === "inativos" ? !ativo : true;
}

function matchesSearch({ descricao, nome }: Servico, term: string) {
  return [nome, descricao].some((value) =>
    value.toLocaleLowerCase().includes(term)
  );
}

interface ServicesPageProps {
  canManage: boolean;
}

export function ServicesPage({ canManage }: ServicesPageProps) {
  const { error, isLoading, removeServico, saveServico, servicos } =
    useServices();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [servicoToDelete, setServicoToDelete] = useState<Servico | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredServicos = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();

    return servicos.filter(
      (servico) =>
        matchesStatus(servico, statusFilter) &&
        (!term || matchesSearch(servico, term))
    );
  }, [search, servicos, statusFilter]);

  const openCreateDialog = useCallback(() => {
    setEditingServico(null);
    setIsFormOpen(true);
  }, []);

  const openEditDialog = useCallback((servico: Servico) => {
    setEditingServico(servico);
    setIsFormOpen(true);
  }, []);

  const closeFormDialog = useCallback(() => setIsFormOpen(false), []);

  const handleSave = useCallback(
    (input: ServicoInput) => saveServico(input, editingServico?.id),
    [editingServico, saveServico]
  );

  const openDeleteDialog = useCallback((servico: Servico) => {
    setDeleteError(null);
    setServicoToDelete(servico);
  }, []);

  const closeDeleteDialog = useCallback(() => setServicoToDelete(null), []);

  const confirmDelete = useCallback(async () => {
    if (!servicoToDelete) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await removeServico(servicoToDelete.id);
      setServicoToDelete(null);
    } catch (deleteFailure) {
      setDeleteError(getApiErrorMessage(deleteFailure, DELETE_ERROR_MESSAGE));
    } finally {
      setIsDeleting(false);
    }
  }, [removeServico, servicoToDelete]);

  let content = (
    <div className="px-6 py-16 text-center">
      <p className="font-roboto-semibold text-base text-white">
        Nenhum serviço encontrado
      </p>
      <p className="mt-2 font-roboto text-sm text-zinc-500">
        {canManage
          ? "Tente outro filtro ou cadastre um novo serviço."
          : "Tente outro filtro ou termo de busca."}
      </p>
    </div>
  );

  if (filteredServicos.length > 0) {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-zinc-800 border-b bg-zinc-950/30">
            <tr className="font-roboto-medium text-xs text-zinc-500 uppercase tracking-wide">
              <th className="px-5 py-4">Serviço</th>
              <th className="px-5 py-4">Duração</th>
              <th className="px-5 py-4">Preço</th>
              <th className="px-5 py-4">Status</th>
              {canManage ? (
                <th className="px-5 py-4 text-right">Ações</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {filteredServicos.map((servico) => (
              <tr className="font-roboto text-sm" key={servico.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <ScissorsIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-roboto-medium text-white">
                        {servico.nome}
                      </p>
                      {servico.descricao ? (
                        <p className="mt-0.5 max-w-sm truncate text-xs text-zinc-500">
                          {servico.descricao}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-400">
                  {servico.duracaoMinutos} min
                </td>
                <td className="px-5 py-4 font-roboto-medium text-white">
                  {formatCurrency(servico.preco)}
                </td>
                <td className="px-5 py-4">
                  <ActiveBadge ativo={servico.ativo} />
                </td>
                {canManage ? (
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-lg px-3 py-2 font-roboto-medium text-brand text-xs transition hover:bg-brand/10"
                        onClick={() => openEditDialog(servico)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        aria-label={`Excluir ${servico.nome}`}
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-danger/10 hover:text-danger"
                        onClick={() => openDeleteDialog(servico)}
                        type="button"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  let body: ReactNode = (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30">
      <div className="flex items-center justify-between border-zinc-800 border-b px-5 py-4">
        <p className="font-roboto-medium text-sm text-white">
          {filteredServicos.length}{" "}
          {filteredServicos.length === 1 ? "serviço" : "serviços"}
        </p>
      </div>
      {content}
    </div>
  );

  if (isLoading) {
    body = <LoadingPanel label="Carregando serviços..." />;
  } else if (error) {
    body = <ErrorPanel message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-roboto text-sm text-zinc-500">Catálogo</p>
          <h1 className="mt-1 font-roboto-bold text-2xl text-white">
            Serviços
          </h1>
          <p className="mt-2 font-roboto text-sm text-zinc-400">
            Organize os serviços oferecidos pela sua barbearia.
          </p>
        </div>
        {canManage ? (
          <button
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110"
            onClick={openCreateDialog}
            type="button"
          >
            <PlusIcon className="h-4 w-4" />
            Novo serviço
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
          <input
            aria-label="Buscar serviços"
            className="h-12 min-w-0 flex-1 bg-transparent font-roboto text-sm text-white outline-none placeholder:text-zinc-600"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou descrição"
            type="search"
            value={search}
          />
        </div>
        <select
          aria-label="Filtrar por status"
          className="h-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 font-roboto text-sm text-white outline-none focus:border-brand"
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          value={statusFilter}
        >
          <option value="todos">Todos os status</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>
      </div>

      {body}

      {isFormOpen ? (
        <ServiceFormDialog
          onClose={closeFormDialog}
          onSave={handleSave}
          servico={editingServico}
        />
      ) : null}

      <ConfirmDialog
        confirmLabel="Excluir"
        description={`Essa ação removerá ${servicoToDelete?.nome ?? "este serviço"} do catálogo.`}
        error={deleteError}
        isLoading={isDeleting}
        isOpen={servicoToDelete !== null}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir serviço?"
      />
    </div>
  );
}
