import type { Servico, ServicoInput } from "@/features/services/types";
import { api } from "./api-client";

export function listServicos() {
  return api.get<Servico[]>("/servicos");
}

export function createServico(input: ServicoInput) {
  return api.post<Servico>("/servicos", input);
}

export function updateServico(id: number, input: ServicoInput) {
  return api.put<Servico>(`/servicos/${id}`, input);
}

export async function deleteServico(id: number) {
  await api.delete(`/servicos/${id}`);
}
