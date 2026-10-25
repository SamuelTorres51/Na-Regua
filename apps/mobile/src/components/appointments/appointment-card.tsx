import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import {
  type CancellationState,
  getCancellationState,
  MIN_CANCEL_NOTICE_MINUTES,
} from "@/features/appointments/cancellation";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/models";
import { formatDuration, formatPrice } from "@/utils/format";
import { AppointmentSummary } from "./appointment-summary";

const FADE_DURATION = 280;
const ICON_SIZE = 15;
const ACTION_ICON_SIZE = 17;

interface CancellationFooterProps {
  onRequestCancel: () => void;
  serviceName: string;
  state: CancellationState;
}

function CancellationFooter({
  onRequestCancel,
  serviceName,
  state,
}: CancellationFooterProps) {
  switch (state) {
    case "allowed":
      return (
        <Pressable
          accessibilityLabel={`Cancelar agendamento de ${serviceName}`}
          accessibilityRole="button"
          className="mt-4 h-11 flex-row items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 active:opacity-70"
          onPress={onRequestCancel}
        >
          <Ionicons
            color={colors.icon.danger}
            name="close-circle-outline"
            size={ACTION_ICON_SIZE}
          />
          <Text className="ml-2 font-roboto-medium text-red-300 text-sm">
            Cancelar agendamento
          </Text>
        </Pressable>
      );
    case "tooLate":
      return (
        <View className="mt-4 flex-row items-center rounded-2xl bg-zinc-800/50 px-3 py-2.5">
          <Ionicons
            color={colors.icon.muted}
            name="information-circle-outline"
            size={ICON_SIZE}
          />
          <Text className="ml-2 flex-1 font-roboto text-xs text-zinc-500">
            Cancelamento disponível até{" "}
            {formatDuration(MIN_CANCEL_NOTICE_MINUTES)} antes do horário.
          </Text>
        </View>
      );
    default:
      return null;
  }
}

interface AppointmentCardProps {
  appointment: Appointment;
  onRequestCancel: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  onRequestCancel,
}: AppointmentCardProps) {
  const handleRequestCancel = useCallback(
    () => onRequestCancel(appointment),
    [appointment, onRequestCancel]
  );

  return (
    <Animated.View
      className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5"
      entering={FadeIn.duration(FADE_DURATION)}
      layout={LinearTransition}
    >
      <AppointmentSummary
        appointment={appointment}
        trailing={
          <Text className="font-roboto-semibold text-base text-white">
            {formatPrice(appointment.service.priceInCents)}
          </Text>
        }
      />

      <CancellationFooter
        onRequestCancel={handleRequestCancel}
        serviceName={appointment.service.name}
        state={getCancellationState(appointment)}
      />
    </Animated.View>
  );
}
