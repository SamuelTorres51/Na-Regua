import type { ReactNode } from "react";
import { useState } from "react";

import { ProfessionalRatingSummary } from "@/components/reviews/professional-rating-summary";
import { ReviewCard } from "@/components/reviews/review-card";
import { SelectField } from "@/components/ui/select-field";
import { ErrorPanel, LoadingPanel } from "@/components/ui/state-panels";
import { useReviewsQuery } from "@/features/reviews/use-reviews-query";
import { listClientes } from "@/services/clients";
import { listProfissionais } from "@/services/professionals";
import { listarAvaliacoes } from "@/services/reviews";

async function loadReviews() {
  const [avaliacoes, clientes, profissionais] = await Promise.all([
    listarAvaliacoes(),
    listClientes(),
    listProfissionais(),
  ]);

  return { avaliacoes, clientes, profissionais };
}

interface ReviewsListProps {
  data: Awaited<ReturnType<typeof loadReviews>>;
  onFilterChange: (value: string) => void;
  professionalFilter: string;
}

function ReviewsList({
  data,
  onFilterChange,
  professionalFilter,
}: ReviewsListProps) {
  const { avaliacoes, clientes, profissionais } = data;
  const clientesById = new Map(clientes.map(({ id, nome }) => [id, nome]));
  const profissionaisById = new Map(
    profissionais.map(({ id, nome }) => [id, nome])
  );
  const options = [
    { label: "Todos os profissionais", value: "" },
    ...profissionais.map(({ id, nome }) => ({
      label: nome,
      value: String(id),
    })),
  ];
  const selectedId = professionalFilter ? Number(professionalFilter) : null;
  const list =
    selectedId === null
      ? avaliacoes
      : avaliacoes.filter(
          ({ profissionalId }) => profissionalId === selectedId
        );

  return (
    <>
      <div className="grid items-center gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-4 sm:grid-cols-2 sm:p-5">
        <SelectField
          disabled={profissionais.length === 0}
          label="Profissional"
          onChange={onFilterChange}
          options={options}
          value={professionalFilter}
        />
        {selectedId === null ? null : (
          <ProfessionalRatingSummary profissionalId={selectedId} />
        )}
      </div>

      {list.length === 0 ? (
        <p className="rounded-3xl border border-zinc-800 border-dashed px-6 py-14 text-center font-roboto text-sm text-zinc-400">
          {selectedId === null
            ? "Nenhuma avaliação recebida."
            : "Este profissional ainda não recebeu avaliações."}
        </p>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {list.map((avaliacao) => (
            <ReviewCard
              avaliacao={avaliacao}
              cliente={
                clientesById.get(avaliacao.clienteId) ??
                `Cliente #${avaliacao.clienteId}`
              }
              key={avaliacao.id}
              profissional={
                profissionaisById.get(avaliacao.profissionalId) ??
                `Profissional #${avaliacao.profissionalId}`
              }
            />
          ))}
        </ul>
      )}
    </>
  );
}

export function ReviewsPage() {
  const { data, error, retry } = useReviewsQuery(
    loadReviews,
    "Não foi possível carregar as avaliações."
  );
  const [professionalFilter, setProfessionalFilter] = useState("");

  let content: ReactNode;
  if (error) {
    content = (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full">
          <ErrorPanel message={error} />
        </div>
        <button
          className="rounded-xl border border-zinc-700 px-4 py-2 font-roboto-medium text-brand text-sm transition hover:border-brand"
          onClick={retry}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    );
  } else if (data) {
    content = (
      <ReviewsList
        data={data}
        onFilterChange={setProfessionalFilter}
        professionalFilter={professionalFilter}
      />
    );
  } else {
    content = <LoadingPanel label="Carregando avaliações..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-roboto-bold text-2xl text-white">Avaliações</h1>
        <p className="mt-2 font-roboto text-sm text-zinc-400">
          Consulte notas e comentários dos atendimentos.
        </p>
      </header>
      {content}
    </div>
  );
}
