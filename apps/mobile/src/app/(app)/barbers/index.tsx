import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BarberList } from "@/components/catalog/barber-list";
import { ScrollScreen } from "@/components/layout/scroll-screen";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useBarbers } from "@/features/catalog/use-barbers";
import type { Barber } from "@/types/models";

const LIST_DELAY = 260;
const LIST_DURATION = 600;

export default function Barbers() {
  const router = useRouter();
  const { barbers, hasLoadError, isLoading, isRefreshing, refresh } =
    useBarbers();

  const handleSelectBarber = useCallback(
    (barber: Barber) =>
      router.push({ params: { id: barber.id }, pathname: "/barbers/[id]" }),
    [router]
  );

  return (
    <ScrollScreen isRefreshing={isRefreshing} onRefresh={refresh}>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="Toque em um profissional para ver o perfil."
          title={"Nossos\nprofissionais"}
        />

        <Animated.View
          className="mt-8"
          entering={FadeInDown.delay(LIST_DELAY).duration(LIST_DURATION)}
        >
          <BarberList
            barbers={barbers}
            hasLoadError={hasLoadError}
            isLoading={isLoading}
            onSelect={handleSelectBarber}
          />
        </Animated.View>
      </View>
    </ScrollScreen>
  );
}
