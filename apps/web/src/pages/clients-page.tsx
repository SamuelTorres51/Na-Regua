// biome-ignore-all lint/performance/noJsxPropsBind: row actions depend on the selected client
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { AppointmentHistoryDialog } from "@/components/agenda/appointment-history-dialog";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ClientStatusDialog } from "@/components/clients/client-status-dialog";
import { ActiveBadge } from "@/components/ui/active-badge";
import { HistoryIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { ErrorPanel, LoadingPanel } from "@/components/ui/state-panels";
import type { Cliente } from "@/features/clients/types";
import { useClients } from "@/features/clients/use-clients";
import { onlyDigits } from "@/utils/phone";

const PHONE_SEARCH_PATTERN = /^[\d\s()+.-]+$/;

type ClientDialog =
  | { cliente: Cliente | null; type: "form" }
  | { cliente: Cliente; type: "history" | "status" };

interface ClientTableProps {
  clientes: Cliente[];
  hasSearch: boolean;
  onOpenDialog: (dialog: ClientDialog) => void;
}

function ClientTable({ clientes, hasSearch, onOpenDialog }: ClientTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30">
      <div className="flex items-center justify-between border-zinc-800 border-b px-5 py-4">
        <p className="font-roboto-medium text-sm text-white">
          {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
        </p>
      </div>

      {clientes.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-roboto-semibold text-base text-white">
            {hasSearch
              ? "Nenhum cliente encontrado"
              : "Nenhum cliente cadastrado"}
          </p>
          <p className="mt-2 font-roboto text-sm text-zinc-500">
            {hasSearch
              ? "Tente outro termo de busca."
              : "Cadastre um novo cliente para começar."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="border-zinc-800 border-b bg-zinc-950/30">
              <tr className="font-roboto-medium text-xs text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-4" scope="col">
                  Cliente
                </th>
                <th className="px-5 py-4" scope="col">
                  Telefone
                </th>
                <th className="px-5 py-4" scope="col">
                  E-mail
                </th>
                <th className="px-5 py-4" scope="col">
                  Status
                </th>
                <th className="px-5 py-4 text-right" scope="col">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {clientes.map((cliente) => {
                const action = cliente.ativo ? "Inativar" : "Reativar";

                return (
                  <tr className="font-roboto text-sm" key={cliente.id}>
                    <td className="px-5 py-4 font-roboto-medium text-white">
                      {cliente.nome}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {cliente.telefone}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{cliente.email}</td>
                    <td className="px-5 py-4">
                      <ActiveBadge ativo={cliente.ativo} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label={`Ver histórico de ${cliente.nome}`}
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-brand/10 hover:text-brand"
                          onClick={() =>
                            onOpenDialog({ cliente, type: "history" })
                          }
                          title="Ver histórico"
                          type="button"
                        >
                          <HistoryIcon className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={`Editar ${cliente.nome}`}
                          className="rounded-lg px-3 py-2 font-roboto-medium text-brand text-xs transition hover:bg-brand/10"
                          onClick={() =>
                            onOpenDialog({ cliente, type: "form" })
                          }
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          aria-label={`${action} ${cliente.nome}`}
                          className={`rounded-lg px-3 py-2 font-roboto-medium text-xs transition ${cliente.ativo ? "text-danger hover:bg-danger/10" : "text-brand hover:bg-brand/10"}`}
                          onClick={() =>
                            onOpenDialog({ cliente, type: "status" })
                          }
                          type="button"
                        >
                          {action}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ClientsPage() {
  const {
    changeClienteAtivo,
    clientes,
    error,
    isLoading,
    reload,
    saveCliente,
  } = useClients();
  const [dialog, setDialog] = useState<ClientDialog | null>(null);
  const [search, setSearch] = useState("");

  const term = search.trim().toLocaleLowerCase("pt-BR");
  const filteredClients = useMemo(() => {
    if (!term) {
      return clientes;
    }

    const phoneDigits = PHONE_SEARCH_PATTERN.test(term) ? onlyDigits(term) : "";

    return clientes.filter(
      ({ email, nome, telefone }) =>
        nome.toLocaleLowerCase("pt-BR").includes(term) ||
        email.toLocaleLowerCase("pt-BR").includes(term) ||
        telefone.toLocaleLowerCase("pt-BR").includes(term) ||
        (phoneDigits !== "" && onlyDigits(telefone).includes(phoneDigits))
    );
  }, [clientes, term]);

  const openCreateDialog = useCallback(
    () => setDialog({ cliente: null, type: "form" }),
    []
  );
  const closeDialog = useCallback(() => setDialog(null), []);

  let content: ReactNode;

  if (isLoading) {
    content = <LoadingPanel label="Carregando clientes..." />;
  } else if (error) {
    content = (
      <div className="flex flex-col gap-3">
        <ErrorPanel message={error} />
        <button
          className="self-center rounded-xl border border-zinc-700 px-4 py-2 font-roboto-medium text-brand text-sm transition hover:border-brand"
          onClick={reload}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    );
  } else {
    content = (
      <ClientTable
        clientes={filteredClients}
        hasSearch={term.length > 0}
        onOpenDialog={setDialog}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6" inert={dialog !== null}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-roboto text-sm text-zinc-500">Cadastros</p>
            <h1 className="mt-1 font-roboto-bold text-2xl text-white">
              Clientes
            </h1>
            <p className="mt-2 font-roboto text-sm text-zinc-400">
              Gerencie os clientes cadastrados na sua barbearia.
            </p>
          </div>

          <button
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || error !== null}
            onClick={openCreateDialog}
            type="button"
          >
            <PlusIcon className="h-4 w-4" />
            Novo cliente
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
          <input
            aria-label="Buscar clientes"
            className="h-12 min-w-0 flex-1 bg-transparent font-roboto text-sm text-white outline-none placeholder:text-zinc-600"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone"
            type="search"
            value={search}
          />
        </div>

        {content}
      </div>

      {dialog?.type === "form" ? (
        <ClientFormDialog
          cliente={dialog.cliente}
          onClose={closeDialog}
          onSave={saveCliente}
        />
      ) : null}
      {dialog?.type === "status" ? (
        <ClientStatusDialog
          cliente={dialog.cliente}
          onChangeStatus={changeClienteAtivo}
          onClose={closeDialog}
        />
      ) : null}
      {dialog?.type === "history" ? (
        <AppointmentHistoryDialog
          onClose={closeDialog}
          pessoa={dialog.cliente}
          tipo="cliente"
        />
      ) : null}
    </>
  );
}
