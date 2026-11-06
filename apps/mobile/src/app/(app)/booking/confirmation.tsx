import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { BookingStepScreen } from "@/components/booking/booking-step-screen";
import { FormAlert } from "@/components/feedback/form-alert";
import { InfoNote } from "@/components/ui/info-note";
import { PrimaryButton } from "@/components/ui/primary-button";
import { CANCELLATION_POLICY_MESSAGE } from "@/features/appointments/cancellation";
import { useBookingConfirmation } from "@/features/booking/use-booking-confirmation";
import { layout } from "@/theme/styles";

export default function BookingConfirmationStep() {
  const { barberId, serviceId, startsAt } = useLocalSearchParams<{
    barberId: string;
    serviceId: string;
    startsAt: string;
  }>();
  const { confirmError, handleChooseAnotherTime, handleConfirm, isConfirming } =
    useBookingConfirmation({ barberId, serviceId, startsAt });

  return (
    <BookingStepScreen
      barberId={barberId}
      serviceId={serviceId}
      startsAt={startsAt}
      step="confirmation"
      subtitle="Revise e confirme o agendamento."
    >
      <View style={layout.actionGroup}>
        <InfoNote message={CANCELLATION_POLICY_MESSAGE} />

        <View className="mt-4">
          <FormAlert message={confirmError?.message ?? null} />

          {confirmError?.hasConflict ? (
            <PrimaryButton
              accessibilityLabel="Escolher outro horário"
              label="Escolher outro horário"
              onPress={handleChooseAnotherTime}
            />
          ) : (
            <PrimaryButton
              accessibilityLabel="Confirmar agendamento"
              isLoading={isConfirming}
              label="Confirmar agendamento"
              onPress={handleConfirm}
            />
          )}
        </View>
      </View>
    </BookingStepScreen>
  );
}
