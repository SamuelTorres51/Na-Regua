import { useCallback, useEffect, useState } from "react";

import type { Turno } from "@/features/business-hours/schedule";
import { getApiErrorMessage } from "@/services/api-client";
import { getBusinessHours } from "@/services/business-hours";
import { getProfessionalSchedule } from "@/services/professional-schedule";

const LOAD_ERROR_MESSAGE =
  "Não foi possível consultar a jornada do profissional.";

type ScheduleResult = { attempt: number } & (
  | { turnos: Turno[] | null; type: "success" }
  | { message: string; type: "error" }
);

interface BusinessHoursResult {
  attempt: number;
  turnos: Turno[] | null;
}

export function useProfessionalSchedule(profissionalId: number) {
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [businessHours, setBusinessHours] =
    useState<BusinessHoursResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;

    getProfessionalSchedule(profissionalId)
      .then(({ turnos }) => {
        if (isActive) {
          setResult({ attempt, turnos, type: "success" });
        }
      })
      .catch((failure) => {
        if (isActive) {
          setResult({
            attempt,
            message: getApiErrorMessage(failure, LOAD_ERROR_MESSAGE),
            type: "error",
          });
        }
      });

    getBusinessHours()
      .then(({ turnos }) => {
        if (isActive) {
          setBusinessHours({ attempt, turnos });
        }
      })
      .catch(() => {
        if (isActive) {
          setBusinessHours({ attempt, turnos: null });
        }
      });

    return () => {
      isActive = false;
    };
  }, [attempt, profissionalId]);

  const retry = useCallback(() => setAttempt((previous) => previous + 1), []);
  const acceptSaved = useCallback(
    (turnos: Turno[] | null) => setResult({ attempt, turnos, type: "success" }),
    [attempt]
  );

  return {
    acceptSaved,
    expediente: businessHours?.attempt === attempt ? businessHours : null,
    retry,
    schedule: result?.attempt === attempt ? result : null,
  };
}
