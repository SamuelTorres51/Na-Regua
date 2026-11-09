import { ApiError, HTTP_STATUS } from "./api-client";
import { simulateLatency } from "./fake-api";

// PROVISÓRIO: guarda em memória os dados usados enquanto VITE_API_URL não
// estiver configurada. Tudo volta ao estado inicial ao recarregar a página.
export function createMockStore<TItem extends { id: number }>(
  initialItems: TItem[]
) {
  let items = [...initialItems];

  function findOrThrow(id: number) {
    const item = items.find((current) => current.id === id);

    if (!item) {
      throw new ApiError("Registro não encontrado.", {
        status: HTTP_STATUS.notFound,
      });
    }

    return item;
  }

  return {
    async insert(data: Omit<TItem, "id">) {
      await simulateLatency();
      const id = Math.max(0, ...items.map((current) => current.id)) + 1;
      const item = { ...data, id } as TItem;
      items = [...items, item];
      return item;
    },
    async list() {
      await simulateLatency();
      return [...items];
    },
    async remove(id: number) {
      await simulateLatency();
      findOrThrow(id);
      items = items.filter((item) => item.id !== id);
    },
    async update(id: number, changes: Partial<Omit<TItem, "id">>) {
      await simulateLatency();
      const item = { ...findOrThrow(id), ...changes };
      items = items.map((current) => (current.id === id ? item : current));
      return item;
    },
  };
}
