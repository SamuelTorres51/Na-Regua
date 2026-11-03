import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ServiceList } from "@/components/catalog/service-list";
import { ScrollScreen } from "@/components/layout/scroll-screen";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useServices } from "@/features/catalog/use-services";
import type { Service } from "@/types/models";

const LIST_DELAY = 260;
const LIST_DURATION = 600;

export default function Services() {
  const router = useRouter();
  const { hasLoadError, isLoading, isRefreshing, refresh, services } =
    useServices();

  const handleSelectService = useCallback(
    (service: Service) =>
      router.push({ params: { serviceId: service.id }, pathname: "/booking" }),
    [router]
  );

  return (
    <ScrollScreen isRefreshing={isRefreshing} onRefresh={refresh}>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="Toque em um serviço para agendar."
          title={"Serviços\ne preços"}
        />

        <Animated.View
          className="mt-8"
          entering={FadeInDown.delay(LIST_DELAY).duration(LIST_DURATION)}
        >
          <ServiceList
            hasLoadError={hasLoadError}
            isLoading={isLoading}
            onSelect={handleSelectService}
            services={services}
          />
        </Animated.View>
      </View>
    </ScrollScreen>
  );
}
