import type {
  AtualizarProfissionalInput,
  NovoProfissionalInput,
  Profissional,
} from "@/features/professionals/types";
import type { Servico } from "@/features/services/types";
import { ApiError, api, HTTP_STATUS, isApiEnabled } from "./api-client";
import { listServicos } from "./catalog";
import { simulateLatency } from "./fake-api";
import { createMockStore } from "./mock-store";

// PROVISÓRIO: dados exibidos enquanto VITE_API_URL não estiver configurada.
const PROFISSIONAIS_MOCK: Profissional[] = [
  {
    ativo: true,
    email: "rafael.costa@naregua.com",
    id: 1,
    nome: "Rafael Costa",
    telefone: "86999991001",
  },
  {
    ativo: true,
    email: "lucas.mendes@naregua.com",
    id: 2,
    nome: "Lucas Mendes",
    telefone: "86988882002",
  },
  {
    ativo: false,
    email: "bruno.santos@naregua.com",
    id: 3,
    nome: "Bruno Santos",
    telefone: "86977773003",
  },
];

const mockProfissionais = createMockStore(PROFISSIONAIS_MOCK);

function listProfissionaisWithApi() {
  return api.get<Profissional[]>("/profissionais");
}

function createProfissionalWithApi(input: NovoProfissionalInput) {
  return api.post<Profissional>("/profissionais", input);
}

function updateProfissionalWithApi(
  id: number,
  input: AtualizarProfissionalInput
) {
  return api.put<Profissional>(`/profissionais/${id}`, input);
}

function setProfissionalAtivoWithApi(id: number, ativo: boolean) {
  const action = ativo ? "reativar" : "inativar";
  return api.patch<Profissional>(`/profissionais/${id}/${action}`);
}

function createProfissionalWithMock({
  email,
  nome,
  telefone,
}: NovoProfissionalInput) {
  return mockProfissionais.insert({ ativo: true, email, nome, telefone });
}

function setProfissionalAtivoWithMock(id: number, ativo: boolean) {
  return mockProfissionais.update(id, { ativo });
}

function listServicosDoProfissionalWithApi(profissionalId: number) {
  return api.get<Servico[]>(`/profissionais/${profissionalId}/servicos`);
}

async function associarServicoWithApi(
  profissionalId: number,
  servicoId: number
) {
  await api.post(`/profissionais/${profissionalId}/servicos/${servicoId}`);
}

async function desassociarServicoWithApi(
  profissionalId: number,
  servicoId: number
) {
  await api.delete(`/profissionais/${profissionalId}/servicos/${servicoId}`);
}

// PROVISÓRIO: ids dos serviços de cada profissional no modo sem API.
const mockAssociacoes = new Map<number, number[]>([
  [1, [1, 3]],
  [2, [2, 4]],
  [3, [3]],
]);

async function listServicosDoProfissionalWithMock(profissionalId: number) {
  const servicoIds = mockAssociacoes.get(profissionalId) ?? [];
  const servicos = await listServicos();

  return servicos.filter((servico) => servicoIds.includes(servico.id));
}

async function associarServicoWithMock(
  profissionalId: number,
  servicoId: number
) {
  await simulateLatency();
  const servicoIds = mockAssociacoes.get(profissionalId) ?? [];

  if (servicoIds.includes(servicoId)) {
    throw new ApiError("O profissional já está associado a este serviço.", {
      status: HTTP_STATUS.conflict,
    });
  }

  mockAssociacoes.set(profissionalId, [...servicoIds, servicoId]);
}

async function desassociarServicoWithMock(
  profissionalId: number,
  servicoId: number
) {
  await simulateLatency();
  const servicoIds = mockAssociacoes.get(profissionalId) ?? [];

  mockAssociacoes.set(
    profissionalId,
    servicoIds.filter((id) => id !== servicoId)
  );
}

export const listProfissionais = isApiEnabled
  ? listProfissionaisWithApi
  : mockProfissionais.list;
export const createProfissional = isApiEnabled
  ? createProfissionalWithApi
  : createProfissionalWithMock;
export const updateProfissional = isApiEnabled
  ? updateProfissionalWithApi
  : mockProfissionais.update;
export const setProfissionalAtivo = isApiEnabled
  ? setProfissionalAtivoWithApi
  : setProfissionalAtivoWithMock;
export const listServicosDoProfissional = isApiEnabled
  ? listServicosDoProfissionalWithApi
  : listServicosDoProfissionalWithMock;
export const associarServico = isApiEnabled
  ? associarServicoWithApi
  : associarServicoWithMock;
export const desassociarServico = isApiEnabled
  ? desassociarServicoWithApi
  : desassociarServicoWithMock;
