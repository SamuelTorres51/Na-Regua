import { NotificationFeedbackType, notificationAsync } from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { createAppointment } from "@/services/booking";
import type { BookingRequest } from "@/types/models";
import {
  type ConfirmationError,
  toConfirmationError,
} from "./confirmation-errors";

const CONFIRM_ERROR_MESSAGE =
  "Não foi possível confirmar o agendamento. Tente novamente.";

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
      setConfirmError(toConfirmationError(error, CONFIRM_ERROR_MESSAGE));
      setIsConfirming(false);
    }
  }, [barberId, router, serviceId, startsAt]);

  const handleChooseAnotherTime = useCallback(() => router.back(), [router]);

  const handleGoToAppointments = useCallback(() => {
    router.dismissAll();
    router.navigate("/appointments");
  }, [router]);

  return {
    confirmError,
    handleChooseAnotherTime,
    handleConfirm,
    handleGoToAppointments,
    isConfirming,
  };
}
