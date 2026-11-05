import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { BookingStepScreen } from "@/components/booking/booking-step-screen";
import { ServiceList } from "@/components/catalog/service-list";
import { BOOKING_SELECT_HINT } from "@/features/booking/steps";
import { useServices } from "@/features/catalog/use-services";
import type { Service } from "@/types/models";

export default function BookingServiceStep() {
  const router = useRouter();
  const { barberId } = useLocalSearchParams<{ barberId?: string }>();
  const { hasLoadError, isLoading, isRefreshing, refresh, services } =
    useServices(barberId);

  const handleSelectService = useCallback(
    (service: Service) => {
      if (barberId) {
        router.push({
          params: { barberId, serviceId: service.id },
          pathname: "/booking/schedule",
        });
        return;
      }

      router.push({
        params: { serviceId: service.id },
        pathname: "/booking/barber",
      });
    },
    [barberId, router]
  );

  return (
    <BookingStepScreen
      barberId={barberId}
      isRefreshing={isRefreshing}
      onRefresh={refresh}
      step="service"
      subtitle="Escolha o serviço."
    >
      <ServiceList
        actionHint={BOOKING_SELECT_HINT}
        actionLabel="Escolher"
        emptyDescription={
          barberId
            ? "Este profissional ainda não tem serviços disponíveis."
            : undefined
        }
        hasLoadError={hasLoadError}
        isLoading={isLoading}
        onSelect={handleSelectService}
        services={services}
      />
    </BookingStepScreen>
  );
}
