import type { Servico, ServicoInput } from "@/features/services/types";
import { api, isApiEnabled } from "./api-client";
import { createMockStore } from "./mock-store";

// PROVISÓRIO: dados exibidos enquanto VITE_API_URL não estiver configurada.
const SERVICOS_MOCK: Servico[] = [
  {
    ativo: true,
    descricao: "Corte com acabamento na máquina e na tesoura.",
    duracaoMinutos: 45,
    id: 1,
    nome: "Corte degradê",
    preco: 35,
  },
  {
    ativo: true,
    descricao: "Corte clássico feito na tesoura.",
    duracaoMinutos: 40,
    id: 2,
    nome: "Corte social",
    preco: 30,
  },
  {
    ativo: true,
    descricao: "Barba com toalha quente e navalha.",
    duracaoMinutos: 30,
    id: 3,
    nome: "Barba completa",
    preco: 25,
  },
  {
    ativo: true,
    descricao: "",
    duracaoMinutos: 20,
    id: 4,
    nome: "Sobrancelha masculina",
    preco: 15,
  },
  {
    ativo: false,
    descricao: "Corte e barba no mesmo atendimento.",
    duracaoMinutos: 70,
    id: 5,
    nome: "Corte + barba",
    preco: 55,
  },
];

const mockServicos = createMockStore(SERVICOS_MOCK);

function listServicosWithApi() {
  return api.get<Servico[]>("/servicos");
}

function createServicoWithApi(input: ServicoInput) {
  return api.post<Servico>("/servicos", input);
}

function updateServicoWithApi(id: number, input: ServicoInput) {
  return api.put<Servico>(`/servicos/${id}`, input);
}

async function deleteServicoWithApi(id: number) {
  await api.delete(`/servicos/${id}`);
}

export const listServicos = isApiEnabled
  ? listServicosWithApi
  : mockServicos.list;
export const createServico = isApiEnabled
  ? createServicoWithApi
  : mockServicos.insert;
export const updateServico = isApiEnabled
  ? updateServicoWithApi
  : mockServicos.update;
export const deleteServico = isApiEnabled
  ? deleteServicoWithApi
  : mockServicos.remove;
