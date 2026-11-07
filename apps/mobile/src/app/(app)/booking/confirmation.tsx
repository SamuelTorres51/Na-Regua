import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { BookingStepScreen } from "@/components/booking/booking-step-screen";
import { ConfirmationActions } from "@/components/booking/confirmation-actions";
import { InfoNote } from "@/components/ui/info-note";
import { CHANGE_POLICY_MESSAGE } from "@/features/appointments/cancellation";
import { useBookingConfirmation } from "@/features/booking/use-booking-confirmation";
import { layout } from "@/theme/styles";

export default function BookingConfirmationStep() {
  const { barberId, serviceId, startsAt } = useLocalSearchParams<{
    barberId: string;
    serviceId: string;
    startsAt: string;
  }>();
  const {
    confirmError,
    handleChooseAnotherTime,
    handleConfirm,
    handleGoToAppointments,
    isConfirming,
  } = useBookingConfirmation({ barberId, serviceId, startsAt });

  return (
    <BookingStepScreen
      barberId={barberId}
      serviceId={serviceId}
      startsAt={startsAt}
      step="confirmation"
      subtitle="Revise e confirme o agendamento."
    >
      <View style={layout.actionGroup}>
        <InfoNote message={CHANGE_POLICY_MESSAGE} />

        <View className="mt-4">
          <ConfirmationActions
            confirmError={confirmError}
            confirmLabel="Confirmar agendamento"
            isConfirming={isConfirming}
            onChooseAnotherTime={handleChooseAnotherTime}
            onConfirm={handleConfirm}
            onGoToAppointments={handleGoToAppointments}
          />
        </View>
      </View>
    </BookingStepScreen>
  );
}
