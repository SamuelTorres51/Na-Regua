import { useCallback, useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import type { Appointment } from "@/types/models";

const CANCEL_SUCCESS_MESSAGE = "Agendamento cancelado.";
const CANCEL_ERROR_MESSAGE = "Não foi possível cancelar. Tente novamente.";

interface CancellationDialogState {
  appointment: Appointment;
  isVisible: boolean;
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
    } catch {
      showToast({ message: CANCEL_ERROR_MESSAGE, tone: "error" });
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
