import { StarIcon } from "@/components/ui/icons";
import type { Avaliacao } from "@/features/reviews/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Fortaleza",
});

interface ReviewCardProps {
  avaliacao: Avaliacao;
  cliente: string;
  profissional: string;
}

export function ReviewCard({
  avaliacao,
  cliente,
  profissional,
}: ReviewCardProps) {
  const { criadaEm, nota } = avaliacao;
  const comentario = avaliacao.comentario.trim();

  return (
    <li className="flex min-w-0 flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-roboto-semibold text-sm text-white [overflow-wrap:anywhere]">
            {cliente}
          </p>
          <p className="mt-1 font-roboto text-xs text-zinc-400 [overflow-wrap:anywhere]">
            Atendido por {profissional}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 font-roboto-medium text-brand text-xs">
            <StarIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Nota </span>
            {nota} / 5
          </span>
          <time
            className="font-roboto text-xs text-zinc-500"
            dateTime={criadaEm}
          >
            {dateFormatter.format(new Date(criadaEm))}
          </time>
        </div>
      </div>

      <p
        className={`whitespace-pre-wrap font-roboto text-sm [overflow-wrap:anywhere] ${comentario ? "text-zinc-200" : "text-zinc-500"}`}
      >
        {comentario || "Sem comentário."}
      </p>
    </li>
  );
}
