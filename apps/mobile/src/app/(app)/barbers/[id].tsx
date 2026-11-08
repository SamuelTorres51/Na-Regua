import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BarberProfileDetails } from "@/components/catalog/barber-profile-details";
import { ScrollScreen } from "@/components/layout/scroll-screen";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useBarberProfile } from "@/features/catalog/use-barber-profile";
import type { Service } from "@/types/models";

const DETAILS_DELAY = 260;
const DETAILS_DURATION = 600;

export default function BarberDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hasLoadError, isLoading, isRefreshing, profile, refresh } =
    useBarberProfile(id);

  const handleBook = useCallback(
    () => router.push({ params: { barberId: id }, pathname: "/booking" }),
    [id, router]
  );

  const handleSelectService = useCallback(
    (service: Service) =>
      router.push({
        params: { barberId: id, serviceId: service.id },
        pathname: "/booking/schedule",
      }),
    [id, router]
  );

  return (
    <ScrollScreen isRefreshing={isRefreshing} onRefresh={refresh}>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="Serviços atendidos pelo profissional."
          title={"Perfil do\nprofissional"}
        />

        <Animated.View
          className="mt-8"
          entering={FadeInDown.delay(DETAILS_DELAY).duration(DETAILS_DURATION)}
        >
          <BarberProfileDetails
            hasLoadError={hasLoadError}
            isLoading={isLoading}
            onBook={handleBook}
            onSelectService={handleSelectService}
            profile={profile}
          />
        </Animated.View>
      </View>
    </ScrollScreen>
  );
}
