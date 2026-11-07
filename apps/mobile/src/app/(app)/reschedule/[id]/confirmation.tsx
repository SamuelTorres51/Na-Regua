import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ConfirmationActions } from "@/components/booking/confirmation-actions";
import { RescheduleStepScreen } from "@/components/booking/reschedule-step-screen";
import { InfoNote } from "@/components/ui/info-note";
import { useAppointment } from "@/features/appointments/use-appointment";
import { useRescheduleConfirmation } from "@/features/booking/use-reschedule-confirmation";
import { layout } from "@/theme/styles";

export default function RescheduleConfirmationStep() {
  const { id, startsAt } = useLocalSearchParams<{
    id: string;
    startsAt: string;
  }>();
  const appointment = useAppointment(id);
  const {
    confirmError,
    handleChooseAnotherTime,
    handleConfirm,
    handleGoToAppointments,
    isConfirming,
  } = useRescheduleConfirmation({ appointmentId: id, startsAt });

  return (
    <RescheduleStepScreen
      appointment={appointment}
      startsAt={startsAt}
      step="confirmation"
      subtitle="Revise e confirme o novo horário."
    >
      <View style={layout.actionGroup}>
        <InfoNote message="O horário atual será liberado para outros clientes." />

        <View className="mt-4">
          <ConfirmationActions
            confirmError={confirmError}
            confirmLabel="Confirmar reagendamento"
            isConfirming={isConfirming}
            onChooseAnotherTime={handleChooseAnotherTime}
            onConfirm={handleConfirm}
            onGoToAppointments={handleGoToAppointments}
          />
        </View>
      </View>
    </RescheduleStepScreen>
  );
}
