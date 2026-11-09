import type {
  AtualizarProfissionalInput,
  NovoProfissionalInput,
  Profissional,
} from "@/features/professionals/types";
import { api, isApiEnabled } from "./api-client";
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
