import { NotificationFeedbackType, notificationAsync } from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import { rescheduleAppointment } from "@/services/booking";
import type { RescheduleRequest } from "@/types/models";
import {
  type ConfirmationError,
  toConfirmationError,
} from "./confirmation-errors";

const RESCHEDULE_SUCCESS_MESSAGE = "Horário reagendado.";
const RESCHEDULE_ERROR_MESSAGE =
  "Não foi possível reagendar o horário. Tente novamente.";

export function useRescheduleConfirmation({
  appointmentId,
  startsAt,
}: RescheduleRequest) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<ConfirmationError | null>(
    null
  );

  const handleGoToAppointments = useCallback(() => {
    router.dismissAll();
    router.navigate("/appointments");
  }, [router]);

  const handleConfirm = useCallback(async () => {
    setIsConfirming(true);
    setConfirmError(null);

    try {
      await rescheduleAppointment({ appointmentId, startsAt });
      notificationAsync(NotificationFeedbackType.Success);
      showToast({ message: RESCHEDULE_SUCCESS_MESSAGE, tone: "success" });
      handleGoToAppointments();
    } catch (error) {
      setConfirmError(toConfirmationError(error, RESCHEDULE_ERROR_MESSAGE));
      setIsConfirming(false);
    }
  }, [appointmentId, handleGoToAppointments, showToast, startsAt]);

  const handleChooseAnotherTime = useCallback(() => router.back(), [router]);

  return {
    confirmError,
    handleChooseAnotherTime,
    handleConfirm,
    handleGoToAppointments,
    isConfirming,
  };
}
