import { useCallback, useEffect, useState } from "react";
import { createMockAppointments } from "./mock-appointments";
import type { Appointment } from "./types";

const FAKE_LATENCY_MS = 700;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

// PROVISÓRIO: dados estáticos até a API existir. Na integração, o corpo vira
// useQuery para a lista e useMutation para o cancelamento; o retorno mantém
// a mesma forma para as telas não precisarem mudar.
export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAppointments(createMockAppointments());
      setIsLoading(false);
    }, FAKE_LATENCY_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  const cancelAppointment = useCallback(async (appointmentId: string) => {
    setCancellingId(appointmentId);
    await wait(FAKE_LATENCY_MS);

    setAppointments((current) =>
      current.map(
        (appointment): Appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status: "cancelled" }
            : appointment
      )
    );
    setCancellingId(null);
  }, []);

  return { appointments, cancelAppointment, cancellingId, isLoading };
}
