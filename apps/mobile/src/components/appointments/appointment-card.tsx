import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { Icon } from "@/components/ui/icon";
import {
  type CancellationState,
  getCancellationState,
  MIN_CANCEL_NOTICE_MINUTES,
} from "@/features/appointments/cancellation";
import { classNames } from "@/theme/class-names";
import type { Appointment } from "@/types/models";
import { formatDuration, formatPrice } from "@/utils/format";
import { AppointmentSummary } from "./appointment-summary";

const FADE_DURATION = 280;

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
          <Icon name="close-circle-outline" size="sm" tone="danger" />
          <Text className="ml-2 font-roboto-medium text-red-300 text-sm">
            Cancelar agendamento
          </Text>
        </Pressable>
      );
    case "tooLate":
      return (
        <View className="mt-4 flex-row items-center rounded-2xl bg-zinc-800/50 px-3 py-2.5">
          <Icon name="information-circle-outline" size="sm" tone="muted" />
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
      className={`p-5 ${classNames.card}`}
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
