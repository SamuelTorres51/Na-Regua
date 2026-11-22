import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { BusinessHoursForm } from "@/components/business-hours/business-hours-form";
import { ErrorPanel, LoadingPanel } from "@/components/ui/state-panels";
import type { Turno } from "@/features/business-hours/schedule";
import { getApiErrorMessage, isApiEnabled } from "@/services/api-client";
import { getBusinessHours } from "@/services/business-hours";

const LOAD_ERROR_MESSAGE =
  "Não foi possível carregar o expediente da barbearia.";

type LoadResult = { attempt: number } & (
  | { turnos: Turno[]; type: "success" }
  | { message: string; type: "error" }
);

export function BarbershopPage() {
  const [result, setResult] = useState<LoadResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;

    getBusinessHours()
      .then(({ turnos }) => {
        if (isActive) {
          setResult({ attempt, turnos, type: "success" });
        }
      })
      .catch((error) => {
        if (isActive) {
          setResult({
            attempt,
            message: getApiErrorMessage(error, LOAD_ERROR_MESSAGE),
            type: "error",
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  let content: ReactNode;
  if (result?.attempt !== attempt) {
    content = <LoadingPanel label="Carregando expediente..." />;
  } else if (result.type === "error") {
    content = (
      <div className="flex flex-col gap-3">
        <ErrorPanel message={result.message} />
        <button
          className="self-center rounded-xl border border-zinc-700 px-4 py-2 font-roboto-medium text-brand text-sm transition hover:border-brand"
          onClick={retry}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    );
  } else {
    content = <BusinessHoursForm turnos={result.turnos} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-roboto-bold text-2xl text-white">
          Expediente da barbearia
        </h1>
        <p className="mt-2 font-roboto text-sm text-zinc-400">
          Dias sem turnos ficam fechados. Para criar um intervalo, adicione mais
          de um turno ao mesmo dia.
        </p>
        {isApiEnabled ? null : (
          <p className="mt-2 font-roboto text-brand text-sm">
            Modo de demonstração. Os horários são redefinidos ao recarregar a
            página.
          </p>
        )}
      </header>
      {content}
    </div>
  );
}
