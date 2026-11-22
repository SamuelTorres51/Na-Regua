import type { Avaliacao, MediaAvaliacoes } from "@/features/reviews/types";
import { api } from "./api-client";

export function listarAvaliacoes() {
  return api.get<Avaliacao[]>("/avaliacoes");
}

export function consultarMediaAvaliacoes(profissionalId: number) {
  return api.get<MediaAvaliacoes>(
    `/profissionais/${profissionalId}/avaliacoes/media`
  );
}
