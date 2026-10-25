// biome-ignore-all lint/performance/noJsxPropsBind: row and form handlers depend on local item state
import { useCallback, useMemo, useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import {
  CalendarIcon,
  HistoryIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";

interface Client {
  email: string;
  id: number;
  name: string;
  phone: string;
}

interface ClientForm {
  email: string;
  name: string;
  phone: string;
}

interface ServiceHistory {
  date: string;
  professional: string;
  service: string;
  time: string;
  value: string;
}

const INITIAL_CLIENTS: Client[] = [
  {
    email: "carlos@email.com",
    id: 1,
    name: "Carlos Eduardo Silva",
    phone: "(86) 99999-0001",
  },
  {
    email: "mariana@email.com",
    id: 2,
    name: "Mariana Oliveira",
    phone: "(86) 98888-0002",
  },
  {
    email: "joao@email.com",
    id: 3,
    name: "João Pedro Santos",
    phone: "(86) 97777-0003",
  },
];

const EMPTY_FORM: ClientForm = { email: "", name: "", phone: "" };

const SERVICE_HISTORY: Record<number, ServiceHistory[]> = {
  1: [
    {
      date: "18/10/2026",
      professional: "Rafael Costa",
      service: "Corte degradê",
      time: "09:00",
      value: "R$ 35,00",
    },
    {
      date: "20/09/2026",
      professional: "Rafael Costa",
      service: "Barba",
      time: "14:30",
      value: "R$ 25,00",
    },
  ],
  2: [
    {
      date: "12/10/2026",
      professional: "Lucas Mendes",
      service: "Corte feminino",
      time: "16:00",
      value: "R$ 45,00",
    },
  ],
};

function formatDate(client: Client) {
  return client.email ? "Cliente ativo" : "Sem contato";
}

export function ClientsPage() {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    if (!normalizedSearch) {
      return clients;
    }

    return clients.filter((client) =>
      [client.name, client.email, client.phone].some((value) =>
        value.toLocaleLowerCase().includes(normalizedSearch)
      )
    );
  }, [clients, search]);

  const openCreateDialog = useCallback(() => {
    setEditingClient(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((client: Client) => {
    setEditingClient(client);
    setForm({ email: client.email, name: client.name, phone: client.phone });
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const updateForm = useCallback(
    (field: keyof ClientForm, value: string) =>
      setForm((current) => ({ ...current, [field]: value })),
    []
  );

  const handleSubmit = useCallback(() => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!(name && email && phone)) {
      return;
    }

    if (editingClient) {
      setClients((current) =>
        current.map((client) =>
          client.id === editingClient.id
            ? { ...client, email, name, phone }
            : client
        )
      );
    } else {
      setClients((current) => [
        ...current,
        { email, id: Date.now(), name, phone },
      ]);
    }

    closeDialog();
  }, [closeDialog, editingClient, form]);

  const handleDelete = useCallback((client: Client) => {
    setClientToDelete(client);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!clientToDelete) {
      return;
    }

    setClients((current) =>
      current.filter((client) => client.id !== clientToDelete.id)
    );
    setClientToDelete(null);
  }, [clientToDelete]);

  const openHistory = useCallback((client: Client) => {
    setHistoryClient(client);
  }, []);
  const history = historyClient
    ? (SERVICE_HISTORY[historyClient.id] ?? [])
    : [];

  return (
    <div className="flex flex-col gap-6">
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
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110"
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

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center justify-between border-zinc-800 border-b px-5 py-4">
          <p className="font-roboto-medium text-sm text-white">
            {filteredClients.length}{" "}
            {filteredClients.length === 1 ? "cliente" : "clientes"}
          </p>
        </div>

        {filteredClients.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-roboto-semibold text-base text-white">
              Nenhum cliente encontrado
            </p>
            <p className="mt-2 font-roboto text-sm text-zinc-500">
              Tente outro termo de busca ou cadastre um novo cliente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="border-zinc-800 border-b bg-zinc-950/30">
                <tr className="font-roboto-medium text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Telefone</th>
                  <th className="px-5 py-4">E-mail</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredClients.map((client) => (
                  <tr className="font-roboto text-sm" key={client.id}>
                    <td className="px-5 py-4 font-roboto-medium text-white">
                      {client.name}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{client.phone}</td>
                    <td className="px-5 py-4 text-zinc-400">{client.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-emerald-400 text-xs">
                        {formatDate(client)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label={`Ver histórico de ${client.name}`}
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-brand/10 hover:text-brand"
                          onClick={() => openHistory(client)}
                          type="button"
                        >
                          <HistoryIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg px-3 py-2 font-roboto-medium text-brand text-xs transition hover:bg-brand/10"
                          onClick={() => openEditDialog(client)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          aria-label={`Excluir ${client.name}`}
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-danger/10 hover:text-danger"
                          onClick={() => handleDelete(client)}
                          type="button"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        description={
          editingClient
            ? "Atualize os dados do cliente."
            : "Preencha os dados para adicionar um cliente."
        }
        isOpen={isDialogOpen}
        onClose={closeDialog}
        title={editingClient ? "Editar cliente" : "Novo cliente"}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <TextField
            autoComplete="name"
            label="Nome completo"
            name="name"
            onChange={(value) => updateForm("name", value)}
            placeholder="Nome do cliente"
            value={form.name}
          />
          <TextField
            autoComplete="tel"
            label="Telefone"
            name="phone"
            onChange={(value) => updateForm("phone", value)}
            placeholder="(00) 00000-0000"
            value={form.phone}
          />
          <TextField
            autoComplete="email"
            label="E-mail"
            name="email"
            onChange={(value) => updateForm("email", value)}
            placeholder="cliente@email.com"
            type="email"
            value={form.email}
          />
          <div className="mt-2 flex justify-end gap-3">
            <button
              className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
              onClick={closeDialog}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="h-11 rounded-xl bg-brand px-5 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110"
              type="submit"
            >
              Salvar cliente
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog
        description={`Serviços realizados para ${historyClient?.name ?? "este cliente"}.`}
        isOpen={historyClient !== null}
        onClose={() => setHistoryClient(null)}
        title="Histórico de serviços"
      >
        {history.length ? (
          <div className="flex flex-col gap-3">
            {history.map((item) => (
              <div
                className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4"
                key={`${item.date}-${item.service}`}
              >
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-roboto-medium text-sm text-white">
                      {item.service}
                    </p>
                    <p className="mt-1 font-roboto text-xs text-zinc-500">
                      {item.date} às {item.time} · {item.professional}
                    </p>
                  </div>
                </div>
                <span className="whitespace-nowrap font-roboto-medium text-sm text-zinc-300">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 border-dashed px-5 py-10 text-center">
            <p className="font-roboto-semibold text-sm text-white">
              Nenhum serviço realizado
            </p>
            <p className="mt-2 font-roboto text-xs text-zinc-500">
              O histórico desse cliente aparecerá aqui após o primeiro
              atendimento.
            </p>
          </div>
        )}
      </Dialog>

      <Dialog
        description={`Essa ação removerá ${clientToDelete?.name ?? "este cliente"} da listagem.`}
        isOpen={clientToDelete !== null}
        onClose={() => setClientToDelete(null)}
        title="Excluir cliente?"
      >
        <div className="flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
            onClick={() => setClientToDelete(null)}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="h-11 rounded-xl bg-danger px-5 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110"
            onClick={confirmDelete}
            type="button"
          >
            Excluir
          </button>
        </div>
      </Dialog>
    </div>
  );
}
