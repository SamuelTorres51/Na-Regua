import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/models";
import { AppointmentSummary } from "./appointment-summary";

const FADE_DURATION = 280;
const ICON_SIZE = 22;
const CHEVRON_SIZE = 18;

const CARD_CLASS_NAME = "rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5";

interface MessageCardProps {
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
}

function MessageCard({ description, icon, title }: MessageCardProps) {
  return (
    <View className={`flex-row items-center ${CARD_CLASS_NAME}`}>
      <View className="h-11 w-11 items-center justify-center rounded-full bg-zinc-800/80">
        <Ionicons color={colors.icon.muted} name={icon} size={ICON_SIZE} />
      </View>
      <View className="ml-4 flex-1">
        <Text className="font-roboto-semibold text-base text-zinc-200">
          {title}
        </Text>
        <Text className="mt-0.5 font-roboto text-sm text-zinc-500">
          {description}
        </Text>
      </View>
    </View>
  );
}

interface NextAppointmentProps {
  appointment: Appointment | undefined;
  hasLoadError: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export function NextAppointment({
  appointment,
  hasLoadError,
  isLoading,
  onPress,
}: NextAppointmentProps) {
  if (isLoading) {
    return (
      <View className={`items-center py-10 ${CARD_CLASS_NAME}`}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (hasLoadError) {
    return (
      <MessageCard
        description="Puxe a tela para baixo para tentar de novo."
        icon="cloud-offline-outline"
        title="Não foi possível carregar"
      />
    );
  }

  if (!appointment) {
    return (
      <MessageCard
        description="Toque em Agendar para marcar seu próximo corte."
        icon="calendar-clear-outline"
        title="Nenhum horário marcado"
      />
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(FADE_DURATION)}>
      <Pressable
        accessibilityLabel={`Ver agendamento de ${appointment.service.name}`}
        accessibilityRole="button"
        className={`active:opacity-80 ${CARD_CLASS_NAME}`}
        onPress={onPress}
      >
        <AppointmentSummary
          appointment={appointment}
          trailing={
            <Ionicons
              color={colors.icon.muted}
              name="chevron-forward"
              size={CHEVRON_SIZE}
            />
          }
        />
      </Pressable>
    </Animated.View>
  );
}
