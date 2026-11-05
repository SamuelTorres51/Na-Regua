import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { BookingStepScreen } from "@/components/booking/booking-step-screen";
import { BarberList } from "@/components/catalog/barber-list";
import { BOOKING_SELECT_HINT } from "@/features/booking/steps";
import { useBarbers } from "@/features/catalog/use-barbers";
import type { Barber } from "@/types/models";

export default function BookingBarberStep() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { barbers, hasLoadError, isLoading, isRefreshing, refresh } =
    useBarbers(serviceId);

  const handleSelectBarber = useCallback(
    (barber: Barber) =>
      router.push({
        params: { barberId: barber.id, serviceId },
        pathname: "/booking/schedule",
      }),
    [router, serviceId]
  );

  return (
    <BookingStepScreen
      isRefreshing={isRefreshing}
      onRefresh={refresh}
      serviceId={serviceId}
      step="barber"
      subtitle="Escolha o profissional."
    >
      <BarberList
        actionHint={BOOKING_SELECT_HINT}
        barbers={barbers}
        emptyDescription="Nenhum profissional atende este serviço no momento."
        hasLoadError={hasLoadError}
        isLoading={isLoading}
        onSelect={handleSelectBarber}
        title="Profissionais disponíveis"
      />
    </BookingStepScreen>
  );
}
