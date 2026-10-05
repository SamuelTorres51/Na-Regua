import { useCallback, useState } from "react";
import type { Appointment } from "@/types/models";

interface CancellationDialogState {
  appointment: Appointment;
  isVisible: boolean;
}

export function useCancellationDialog(
  cancelAppointment: (appointmentId: string) => Promise<void>
) {
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
    } finally {
      handleCloseDialog();
    }
  }, [cancelAppointment, dialog, handleCloseDialog]);

  return {
    dialog,
    handleCloseDialog,
    handleConfirmCancel,
    handleRequestCancel,
  };
}
