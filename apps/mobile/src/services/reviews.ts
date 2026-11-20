import type { Review } from "@/types/models";
import { api, HTTP_STATUS, hasApiStatus } from "./api-client";

const UNAVAILABLE_STATUSES: readonly number[] = [
  HTTP_STATUS.conflict,
  HTTP_STATUS.notFound,
];

export const MAX_REVIEW_COMMENT_LENGTH = 1000;

export class ReviewUnavailableError extends Error {
  constructor() {
    super("O atendimento não pode ser avaliado.");
    this.name = "ReviewUnavailableError";
  }
}

export interface CreateReviewInput {
  appointmentId: string;
  comment: string;
  rating: number;
}

interface ReviewResponse {
  agendamentoId: number;
  comentario: string;
  criadaEm: string;
  id: number;
  nota: number;
}

function toReview({
  agendamentoId,
  comentario,
  criadaEm,
  id,
  nota,
}: ReviewResponse): Review {
  return {
    appointmentId: String(agendamentoId),
    comment: comentario,
    createdAt: criadaEm,
    id: String(id),
    rating: nota,
  };
}

function rethrowReviewUnavailable(error: unknown): never {
  const isUnavailable = UNAVAILABLE_STATUSES.some((status) =>
    hasApiStatus(error, status)
  );

  if (isUnavailable) {
    throw new ReviewUnavailableError();
  }

  throw error;
}

export async function listMyReviews() {
  const responses = await api.get<ReviewResponse[]>("/avaliacoes/minhas");

  return responses.map(toReview);
}

export async function createReview({
  appointmentId,
  comment,
  rating,
}: CreateReviewInput) {
  try {
    const response = await api.post<ReviewResponse>(
      `/agendamentos/${appointmentId}/avaliacao`,
      { comentario: comment, nota: rating }
    );

    return toReview(response);
  } catch (error) {
    return rethrowReviewUnavailable(error);
  }
}
