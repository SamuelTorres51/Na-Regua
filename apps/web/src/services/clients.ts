import type {
  AtualizarClienteInput,
  Cliente,
  NovoClienteInput,
} from "@/features/clients/types";
import { api } from "./api-client";

export function listClientes(apenasAtivos = false) {
  return api.get<Cliente[]>("/clientes", {
    query: { apenas_ativos: apenasAtivos || undefined },
  });
}

export function createCliente(input: NovoClienteInput) {
  return api.post<Cliente>("/clientes", input);
}

export function updateCliente(id: number, input: AtualizarClienteInput) {
  return api.put<Cliente>(`/clientes/${id}`, input);
}

export function setClienteAtivo(id: number, ativo: boolean) {
  const action = ativo ? "reativar" : "inativar";

  return api.patch<Cliente>(`/clientes/${id}/${action}`);
}
