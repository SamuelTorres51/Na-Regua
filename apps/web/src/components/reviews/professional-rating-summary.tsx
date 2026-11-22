import type { ReactNode } from "react";
import { useCallback } from "react";

import { SpinnerIcon, StarIcon } from "@/components/ui/icons";
import { useReviewsQuery } from "@/features/reviews/use-reviews-query";
import { consultarMediaAvaliacoes } from "@/services/reviews";

const averageFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 1,
});

interface ProfessionalRatingSummaryProps {
  profissionalId: number;
}

export function ProfessionalRatingSummary({
  profissionalId,
}: ProfessionalRatingSummaryProps) {
  const load = useCallback(
    () => consultarMediaAvaliacoes(profissionalId),
    [profissionalId]
  );
  const { data, error, retry } = useReviewsQuery(
    load,
    "Não foi possível carregar a média de avaliações."
  );

  let content: ReactNode;
  if (error) {
    content = (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="font-roboto text-danger text-sm" role="alert">
          {error}
        </p>
        <button
          className="rounded-lg border border-zinc-700 px-2.5 py-1 font-roboto-medium text-brand text-xs transition hover:border-brand"
          onClick={retry}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    );
  } else if (!data) {
    content = (
      <p
        className="flex items-center gap-2 font-roboto text-sm text-zinc-400"
        role="status"
      >
        <SpinnerIcon className="h-4 w-4 animate-spin" />
        Carregando média...
      </p>
    );
  } else if (data.mediaNota === null) {
    content = (
      <p className="font-roboto text-sm text-zinc-400">
        Nenhuma avaliação recebida.
      </p>
    );
  } else {
    const { mediaNota, totalAvaliacoes } = data;

    content = (
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-roboto text-sm text-zinc-400">
        <span className="inline-flex items-center gap-1.5 font-roboto-semibold text-brand">
          <StarIcon className="h-4 w-4" />
          {averageFormatter.format(mediaNota)} / 5
        </span>
        <span>
          {totalAvaliacoes} {totalAvaliacoes === 1 ? "avaliação" : "avaliações"}
        </span>
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="font-roboto-medium text-xs text-zinc-400">
        Média das avaliações
      </p>
      {content}
    </div>
  );
}
