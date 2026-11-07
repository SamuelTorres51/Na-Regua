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

interface AppointmentActionsProps {
  onRequestCancel: () => void;
  onRequestReschedule: () => void;
  serviceName: string;
  state: CancellationState;
}

function AppointmentActions({
  onRequestCancel,
  onRequestReschedule,
  serviceName,
  state,
}: AppointmentActionsProps) {
  switch (state) {
    case "allowed":
      return (
        <View className="mt-4 flex-row gap-3">
          <Pressable
            accessibilityLabel={`Reagendar ${serviceName}`}
            accessibilityRole="button"
            className="h-11 flex-1 flex-row items-center justify-center rounded-2xl border border-zinc-700 active:opacity-70"
            onPress={onRequestReschedule}
          >
            <Icon name="calendar-outline" size="sm" tone="subtle" />
            <Text className="ml-2 font-roboto-medium text-sm text-zinc-200">
              Reagendar
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel={`Cancelar agendamento de ${serviceName}`}
            accessibilityRole="button"
            className="h-11 flex-1 flex-row items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 active:opacity-70"
            onPress={onRequestCancel}
          >
            <Icon name="close-circle-outline" size="sm" tone="danger" />
            <Text className="ml-2 font-roboto-medium text-red-300 text-sm">
              Cancelar
            </Text>
          </Pressable>
        </View>
      );
    case "tooLate":
      return (
        <View className="mt-4 flex-row items-center rounded-2xl bg-zinc-800/50 px-3 py-2.5">
          <Icon name="information-circle-outline" size="sm" tone="muted" />
          <Text className="ml-2 flex-1 font-roboto text-xs text-zinc-500">
            Reagendamento e cancelamento disponíveis até{" "}
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
  onRequestReschedule: (appointment: Appointment) => void;
}

export function AppointmentCard({
  appointment,
  onRequestCancel,
  onRequestReschedule,
}: AppointmentCardProps) {
  const handleRequestCancel = useCallback(
    () => onRequestCancel(appointment),
    [appointment, onRequestCancel]
  );

  const handleRequestReschedule = useCallback(
    () => onRequestReschedule(appointment),
    [appointment, onRequestReschedule]
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

      <AppointmentActions
        onRequestCancel={handleRequestCancel}
        onRequestReschedule={handleRequestReschedule}
        serviceName={appointment.service.name}
        state={getCancellationState(appointment)}
      />
    </Animated.View>
  );
}
