import { useCallback, useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import { isNetworkError } from "@/services/api-client";
import { AppointmentNotCancellableError } from "@/services/appointments";
import type { Appointment } from "@/types/models";

const CANCEL_SUCCESS_MESSAGE = "Agendamento cancelado.";
const CANCEL_ERROR_MESSAGE = "Não foi possível cancelar. Tente novamente.";
const NOT_CANCELLABLE_MESSAGE = "Este agendamento não pode mais ser cancelado.";
const NETWORK_ERROR_MESSAGE =
  "Sem conexão com o servidor. Verifique sua internet e tente novamente.";

interface CancellationDialogState {
  appointment: Appointment;
  isVisible: boolean;
}

function describeCancelError(error: unknown) {
  if (error instanceof AppointmentNotCancellableError) {
    return NOT_CANCELLABLE_MESSAGE;
  }

  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  return CANCEL_ERROR_MESSAGE;
}

export function useCancellationDialog(
  cancelAppointment: (appointmentId: string) => Promise<void>
) {
  const { showToast } = useToast();
  const [dialog, setDialog] = useState<CancellationDialogState | null>(null);

  const handleRequestCancel = useCallback((appointment: Appointment) => {
    setDialog({ appointment, isVisible: true });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialog((current) => (current ? { ...current, isVisible: false } : null));
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!dialog) {
      return;
    }

    try {
      await cancelAppointment(dialog.appointment.id);
      showToast({ message: CANCEL_SUCCESS_MESSAGE, tone: "success" });
    } catch (error) {
      showToast({ message: describeCancelError(error), tone: "error" });
    } finally {
      handleCloseDialog();
    }
  }, [cancelAppointment, dialog, handleCloseDialog, showToast]);

  return {
    dialog,
    handleCloseDialog,
    handleConfirmCancel,
    handleRequestCancel,
  };
}
