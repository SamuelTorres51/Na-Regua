import { NotificationFeedbackType, notificationAsync } from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  BookingConflictError,
  type BookingConflictReason,
  createAppointment,
} from "@/services/booking";
import type { BookingRequest } from "@/types/models";

const CONFIRM_ERROR_MESSAGE =
  "Não foi possível confirmar o agendamento. Tente novamente.";

const CONFLICT_MESSAGES: Record<BookingConflictReason, string> = {
  clientBusy:
    "Você já tem um agendamento nesse horário. Escolha outro horário.",
  unavailable: "Este horário não está mais disponível. Escolha outro horário.",
};

interface ConfirmationError {
  hasConflict: boolean;
  message: string;
}

function toConfirmationError(error: unknown): ConfirmationError {
  if (error instanceof BookingConflictError) {
    return { hasConflict: true, message: CONFLICT_MESSAGES[error.reason] };
  }

  return { hasConflict: false, message: CONFIRM_ERROR_MESSAGE };
}

export function useBookingConfirmation({
  barberId,
  serviceId,
  startsAt,
}: BookingRequest) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<ConfirmationError | null>(
    null
  );

  const handleConfirm = useCallback(async () => {
    setIsConfirming(true);
    setConfirmError(null);

    try {
      const appointment = await createAppointment({
        barberId,
        serviceId,
        startsAt,
      });

      notificationAsync(NotificationFeedbackType.Success);
      router.dismissAll();
      router.push({
        params: {
          barberId: appointment.barber.id,
          serviceId: appointment.service.id,
          startsAt: appointment.startsAt,
        },
        pathname: "/booking/success",
      });
    } catch (error) {
      setConfirmError(toConfirmationError(error));
      setIsConfirming(false);
    }
  }, [barberId, router, serviceId, startsAt]);

  const handleChooseAnotherTime = useCallback(() => router.back(), [router]);

  return {
    confirmError,
    handleChooseAnotherTime,
    handleConfirm,
    isConfirming,
  };
}
