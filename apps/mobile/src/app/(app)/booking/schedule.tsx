import { useLocalSearchParams } from "expo-router";
import { BookingStepScreen } from "@/components/booking/booking-step-screen";
import { StateMessage } from "@/components/feedback/state-message";

export default function BookingScheduleStep() {
  const { barberId, serviceId } = useLocalSearchParams<{
    barberId: string;
    serviceId: string;
  }>();

  return (
    <BookingStepScreen
      barberId={barberId}
      serviceId={serviceId}
      step="schedule"
      subtitle="Escolha a data e o horário."
    >
      <StateMessage
        description="A escolha de data e horário está em construção."
        icon="construct-outline"
        title="Em breve"
      />
    </BookingStepScreen>
  );
}
