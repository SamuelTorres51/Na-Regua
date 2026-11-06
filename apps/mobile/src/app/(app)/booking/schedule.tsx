import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { BookingStepScreen } from "@/components/booking/booking-step-screen";
import { SchedulePicker } from "@/components/booking/schedule-picker";
import { useBookingDays } from "@/features/booking/use-booking-days";

export default function BookingScheduleStep() {
  const router = useRouter();
  const { barberId, serviceId } = useLocalSearchParams<{
    barberId: string;
    serviceId: string;
  }>();
  const { days, hasLoadError, isLoading, isRefreshing, refresh } =
    useBookingDays({ barberId, serviceId });

  const handleSelectSlot = useCallback(
    (startsAt: string) =>
      router.push({
        params: { barberId, serviceId, startsAt },
        pathname: "/booking/confirmation",
      }),
    [barberId, router, serviceId]
  );

  return (
    <BookingStepScreen
      barberId={barberId}
      isRefreshing={isRefreshing}
      onRefresh={refresh}
      serviceId={serviceId}
      step="schedule"
      subtitle="Escolha a data e o horário."
    >
      <SchedulePicker
        days={days}
        hasLoadError={hasLoadError}
        isLoading={isLoading}
        onSelectSlot={handleSelectSlot}
      />
    </BookingStepScreen>
  );
}
