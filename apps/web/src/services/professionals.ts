import type {
  AtualizarProfissionalInput,
  NovoProfissionalInput,
  Profissional,
} from "@/features/professionals/types";
import type { Servico } from "@/features/services/types";
import { api } from "./api-client";

export function listProfissionais() {
  return api.get<Profissional[]>("/profissionais");
}

export function createProfissional(input: NovoProfissionalInput) {
  return api.post<Profissional>("/profissionais", input);
}

export function updateProfissional(
  id: number,
  input: AtualizarProfissionalInput
) {
  return api.put<Profissional>(`/profissionais/${id}`, input);
}

export function setProfissionalAtivo(id: number, ativo: boolean) {
  const action = ativo ? "reativar" : "inativar";
  return api.patch<Profissional>(`/profissionais/${id}/${action}`);
}

export function listServicosDoProfissional(profissionalId: number) {
  return api.get<Servico[]>(`/profissionais/${profissionalId}/servicos`);
}

export async function associarServico(
  profissionalId: number,
  servicoId: number
) {
  await api.post(`/profissionais/${profissionalId}/servicos/${servicoId}`);
}

export async function desassociarServico(
  profissionalId: number,
  servicoId: number
) {
  await api.delete(`/profissionais/${profissionalId}/servicos/${servicoId}`);
}
