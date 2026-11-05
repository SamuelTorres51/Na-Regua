import { useLocalSearchParams } from "expo-router";
import { BookingStepScreen } from "@/components/booking/booking-step-screen";
import { StateMessage } from "@/components/feedback/state-message";

export default function BookingConfirmationStep() {
  const { barberId, serviceId, startsAt } = useLocalSearchParams<{
    barberId: string;
    serviceId: string;
    startsAt: string;
  }>();

  return (
    <BookingStepScreen
      barberId={barberId}
      serviceId={serviceId}
      startsAt={startsAt}
      step="confirmation"
      subtitle="Revise e confirme o agendamento."
    >
      <StateMessage
        description="A confirmação do agendamento está em construção."
        icon="construct-outline"
        title="Em breve"
      />
    </BookingStepScreen>
  );
}
