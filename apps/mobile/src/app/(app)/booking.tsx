import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { StateMessage } from "@/components/feedback/state-message";
import { FormScreen } from "@/components/layout/form-screen";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useServices } from "@/features/catalog/use-services";
import { classNames } from "@/theme/class-names";
import { formatDuration, formatPrice } from "@/utils/format";

const FADE_DURATION = 280;

export default function Booking() {
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();
  const { services } = useServices();

  const selectedService = services.find((service) => service.id === serviceId);

  return (
    <FormScreen>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="Escolha o serviço, o profissional e o horário."
          title={"Novo\nagendamento"}
        />

        {selectedService ? (
          <Animated.View
            className="mt-8"
            entering={FadeIn.duration(FADE_DURATION)}
          >
            <Text className="mb-3 font-roboto-medium text-sm text-zinc-400">
              Serviço escolhido
            </Text>
            <View className={`p-5 ${classNames.card}`}>
              <Text className="font-roboto-semibold text-lg text-white">
                {selectedService.name}
              </Text>
              <Text className="mt-1 font-roboto text-sm text-zinc-400">
                {formatDuration(selectedService.durationMinutes)} ·{" "}
                {formatPrice(selectedService.priceInCents)}
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <View className="mt-10">
          <StateMessage
            description="O agendamento pelo app está em construção."
            icon="construct-outline"
            title="Em breve"
          />
        </View>
      </View>
    </FormScreen>
  );
}
