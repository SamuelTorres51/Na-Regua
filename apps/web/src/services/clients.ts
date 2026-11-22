import type {
  AtualizarClienteInput,
  Cliente,
  NovoClienteInput,
} from "@/features/clients/types";
import { api, isApiEnabled } from "./api-client";
import { createMockStore } from "./mock-store";

// Dados de demonstração para o painel sem VITE_API_URL.
const mockClientes = createMockStore<Cliente>([
  {
    ativo: true,
    email: "carlos@email.com",
    id: 1,
    nome: "Carlos Eduardo Silva",
    telefone: "(86) 99999-0001",
  },
  {
    ativo: true,
    email: "mariana@email.com",
    id: 2,
    nome: "Mariana Oliveira",
    telefone: "(86) 98888-0002",
  },
  {
    ativo: true,
    email: "joao@email.com",
    id: 3,
    nome: "João Pedro Santos",
    telefone: "(86) 97777-0003",
  },
]);

export async function listClientes(apenasAtivos = false) {
  if (isApiEnabled) {
    return api.get<Cliente[]>("/clientes", {
      query: { apenas_ativos: apenasAtivos || undefined },
    });
  }

  const clientes = await mockClientes.list();
  return apenasAtivos ? clientes.filter(({ ativo }) => ativo) : clientes;
}

export function createCliente(input: NovoClienteInput) {
  if (isApiEnabled) {
    return api.post<Cliente>("/clientes", input);
  }

  const { email, nome, telefone } = input;
  return mockClientes.insert({ ativo: true, email, nome, telefone });
}

export function updateCliente(id: number, input: AtualizarClienteInput) {
  return isApiEnabled
    ? api.put<Cliente>(`/clientes/${id}`, input)
    : mockClientes.update(id, input);
}

export function setClienteAtivo(id: number, ativo: boolean) {
  const action = ativo ? "reativar" : "inativar";

  return isApiEnabled
    ? api.patch<Cliente>(`/clientes/${id}/${action}`)
    : mockClientes.update(id, { ativo });
}
