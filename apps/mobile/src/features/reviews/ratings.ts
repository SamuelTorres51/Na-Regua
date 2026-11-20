export const MAX_RATING = 5;

export const RATINGS = [1, 2, 3, 4, 5] as const;

export const RATING_LABELS: Record<number, string> = {
  1: "Ruim",
  2: "Regular",
  3: "Bom",
  4: "Muito bom",
  5: "Excelente",
};

export function describeRating(rating: number) {
  return rating === 1 ? "1 estrela" : `${rating} estrelas`;
}
