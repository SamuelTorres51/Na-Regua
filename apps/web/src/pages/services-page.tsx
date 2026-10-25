// biome-ignore-all lint/performance/noJsxPropsBind: service cards and form handlers depend on local state
import { useCallback, useMemo, useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import {
  PlusIcon,
  ScissorsIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";

type ServiceCategory = "Barba" | "Cabelo" | "Estética" | "Manicure" | "Perucas";

interface Service {
  category: ServiceCategory;
  duration: string;
  id: number;
  name: string;
  price: string;
}

interface ServiceForm {
  category: ServiceCategory;
  duration: string;
  name: string;
  price: string;
}

const CATEGORIES: ServiceCategory[] = [
  "Cabelo",
  "Barba",
  "Manicure",
  "Estética",
  "Perucas",
];

const INITIAL_SERVICES: Service[] = [
  {
    category: "Cabelo",
    duration: "45 min",
    id: 1,
    name: "Corte degradê",
    price: "R$ 35,00",
  },
  {
    category: "Cabelo",
    duration: "40 min",
    id: 2,
    name: "Corte social",
    price: "R$ 30,00",
  },
  {
    category: "Cabelo",
    duration: "30 min",
    id: 3,
    name: "Lavagem e escova",
    price: "R$ 25,00",
  },
  {
    category: "Barba",
    duration: "30 min",
    id: 4,
    name: "Barba completa",
    price: "R$ 25,00",
  },
  {
    category: "Barba",
    duration: "20 min",
    id: 5,
    name: "Sobrancelha masculina",
    price: "R$ 15,00",
  },
  {
    category: "Manicure",
    duration: "45 min",
    id: 6,
    name: "Manicure tradicional",
    price: "R$ 30,00",
  },
  {
    category: "Manicure",
    duration: "60 min",
    id: 7,
    name: "Pedicure completa",
    price: "R$ 40,00",
  },
  {
    category: "Estética",
    duration: "50 min",
    id: 8,
    name: "Design de sobrancelha",
    price: "R$ 35,00",
  },
  {
    category: "Perucas",
    duration: "90 min",
    id: 9,
    name: "Aplicação de peruca",
    price: "R$ 80,00",
  },
  {
    category: "Perucas",
    duration: "60 min",
    id: 10,
    name: "Manutenção de peruca",
    price: "R$ 55,00",
  },
];

const EMPTY_FORM: ServiceForm = {
  category: "Cabelo",
  duration: "",
  name: "",
  price: "",
};

function getCategoryClass(category: ServiceCategory) {
  if (category === "Cabelo") {
    return "bg-blue-400/10 text-blue-300";
  }

  if (category === "Barba") {
    return "bg-emerald-400/10 text-emerald-300";
  }

  if (category === "Manicure") {
    return "bg-pink-400/10 text-pink-300";
  }

  if (category === "Perucas") {
    return "bg-violet-400/10 text-violet-300";
  }

  return "bg-brand/10 text-brand";
}

export function ServicesPage() {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [search, setSearch] = useState("");
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  const filteredServices = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        categoryFilter === "Todas" || service.category === categoryFilter;
      const matchesSearch =
        !term ||
        [service.name, service.category].some((value) =>
          value.toLocaleLowerCase().includes(term)
        );

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, search, services]);

  const openCreateDialog = useCallback(() => {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((service: Service) => {
    setEditingService(service);
    setForm({
      category: service.category,
      duration: service.duration,
      name: service.name,
      price: service.price,
    });
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  const updateForm = useCallback(
    (field: keyof ServiceForm, value: string) =>
      setForm((current) => ({ ...current, [field]: value })),
    []
  );

  const handleSubmit = useCallback(() => {
    const name = form.name.trim();
    const duration = form.duration.trim();
    const price = form.price.trim();

    if (!(name && duration && price)) {
      return;
    }

    if (editingService) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingService.id
            ? { ...service, category: form.category, duration, name, price }
            : service
        )
      );
    } else {
      setServices((current) => [
        ...current,
        {
          category: form.category,
          duration,
          id: Date.now(),
          name,
          price,
        },
      ]);
    }

    closeDialog();
  }, [closeDialog, editingService, form]);

  const confirmDelete = useCallback(() => {
    if (!serviceToDelete) {
      return;
    }

    setServices((current) =>
      current.filter((service) => service.id !== serviceToDelete.id)
    );
    setServiceToDelete(null);
  }, [serviceToDelete]);

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
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110"
          onClick={openCreateDialog}
          type="button"
        >
          <PlusIcon className="h-4 w-4" />
          Novo serviço
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
          <input
            aria-label="Buscar serviços"
            className="h-12 min-w-0 flex-1 bg-transparent font-roboto text-sm text-white outline-none placeholder:text-zinc-600"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou categoria"
            type="search"
            value={search}
          />
        </div>
        <select
          aria-label="Filtrar por categoria"
          className="h-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 font-roboto text-sm text-white outline-none focus:border-brand"
          onChange={(event) => setCategoryFilter(event.target.value)}
          value={categoryFilter}
        >
          <option value="Todas">Todas as categorias</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center justify-between border-zinc-800 border-b px-5 py-4">
          <p className="font-roboto-medium text-sm text-white">
            {filteredServices.length}{" "}
            {filteredServices.length === 1
              ? "serviço disponível"
              : "serviços disponíveis"}
          </p>
        </div>
        {filteredServices.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-roboto-semibold text-base text-white">
              Nenhum serviço encontrado
            </p>
            <p className="mt-2 font-roboto text-sm text-zinc-500">
              Tente outro filtro ou cadastre um novo serviço.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-zinc-800 border-b bg-zinc-950/30">
                <tr className="font-roboto-medium text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="px-5 py-4">Serviço</th>
                  <th className="px-5 py-4">Categoria</th>
                  <th className="px-5 py-4">Duração</th>
                  <th className="px-5 py-4">Preço</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredServices.map((service) => (
                  <tr className="font-roboto text-sm" key={service.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                          <ScissorsIcon className="h-4 w-4" />
                        </span>
                        <span className="font-roboto-medium text-white">
                          {service.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${getCategoryClass(service.category)}`}
                      >
                        {service.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {service.duration}
                    </td>
                    <td className="px-5 py-4 font-roboto-medium text-white">
                      {service.price}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-lg px-3 py-2 font-roboto-medium text-brand text-xs transition hover:bg-brand/10"
                          onClick={() => openEditDialog(service)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          aria-label={`Excluir ${service.name}`}
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-danger/10 hover:text-danger"
                          onClick={() => setServiceToDelete(service)}
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
          editingService
            ? "Atualize as informações do serviço."
            : "Cadastre um novo serviço no catálogo."
        }
        isOpen={isDialogOpen}
        onClose={closeDialog}
        title={editingService ? "Editar serviço" : "Novo serviço"}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <TextField
            autoComplete="off"
            label="Nome do serviço"
            name="name"
            onChange={(value) => updateForm("name", value)}
            placeholder="Ex.: Corte degradê"
            value={form.name}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              autoComplete="off"
              label="Duração"
              name="duration"
              onChange={(value) => updateForm("duration", value)}
              placeholder="Ex.: 45 min"
              value={form.duration}
            />
            <TextField
              autoComplete="off"
              label="Preço"
              name="price"
              onChange={(value) => updateForm("price", value)}
              placeholder="Ex.: R$ 35,00"
              value={form.price}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="font-roboto-medium text-sm text-zinc-400"
              htmlFor="service-category"
            >
              Categoria
            </label>
            <select
              className="h-14 rounded-2xl border border-zinc-700 bg-zinc-900/60 px-4 font-roboto text-base text-white outline-none focus:border-brand"
              id="service-category"
              onChange={(event) =>
                updateForm("category", event.target.value as ServiceCategory)
              }
              value={form.category}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
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
              Salvar serviço
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog
        description={`Essa ação removerá ${serviceToDelete?.name ?? "este serviço"} do catálogo.`}
        isOpen={serviceToDelete !== null}
        onClose={() => setServiceToDelete(null)}
        title="Excluir serviço?"
      >
        <div className="flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
            onClick={() => setServiceToDelete(null)}
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
