import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { StateMessage } from "@/components/feedback/state-message";
import { FormScreen } from "@/components/layout/form-screen";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useBarbers } from "@/features/catalog/use-barbers";
import { useServices } from "@/features/catalog/use-services";
import { classNames } from "@/theme/class-names";
import { formatDuration, formatPrice } from "@/utils/format";

const FADE_DURATION = 280;

interface SelectedItemProps {
  description: string;
  label: string;
  title: string;
}

function SelectedItem({ description, label, title }: SelectedItemProps) {
  return (
    <Animated.View className="mt-8" entering={FadeIn.duration(FADE_DURATION)}>
      <Text className="mb-3 font-roboto-medium text-sm text-zinc-400">
        {label}
      </Text>
      <View className={`p-5 ${classNames.card}`}>
        <Text className="font-roboto-semibold text-lg text-white">{title}</Text>
        <Text className="mt-1 font-roboto text-sm text-zinc-400">
          {description}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function Booking() {
  const { barberId, serviceId } = useLocalSearchParams<{
    barberId?: string;
    serviceId?: string;
  }>();
  const { services } = useServices();
  const { barbers } = useBarbers();

  const selectedService = services.find((service) => service.id === serviceId);
  const selectedBarber = barbers.find((barber) => barber.id === barberId);

  return (
    <FormScreen>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle="Escolha o serviço, o profissional e o horário."
          title={"Novo\nagendamento"}
        />

        {selectedService ? (
          <SelectedItem
            description={`${formatDuration(selectedService.durationMinutes)} · ${formatPrice(selectedService.priceInCents)}`}
            label="Serviço escolhido"
            title={selectedService.name}
          />
        ) : null}

        {selectedBarber ? (
          <SelectedItem
            description={selectedBarber.role}
            label="Profissional escolhido"
            title={selectedBarber.name}
          />
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
