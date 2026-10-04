import Feather from "@expo/vector-icons/Feather";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  type CancellationState,
  getCancellationState,
  MIN_CANCEL_NOTICE_MINUTES,
} from "@/features/appointments/appointment-rules";
import type { Appointment } from "@/features/appointments/types";
import { colors } from "@/theme/colors";
import { formatPrice } from "@/utils/currency";
import {
  formatAppointmentDate,
  formatAppointmentTime,
  formatDuration,
} from "@/utils/datetime";
import { AppointmentStatusBadge } from "./appointment-status-badge";

const FADE_DURATION = 280;
const ICON_SIZE = 14;
const ACTION_ICON_SIZE = 16;

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
          <Feather
            color={colors.icon.danger}
            name="x-circle"
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
          <Feather color={colors.icon.muted} name="info" size={ICON_SIZE} />
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
    >
      <View className="flex-row items-center justify-between">
        <AppointmentStatusBadge status={appointment.status} />
        <Text className="font-roboto-semibold text-base text-white">
          {formatPrice(appointment.priceInCents)}
        </Text>
      </View>

      <Text className="mt-4 font-roboto-semibold text-white text-xl">
        {appointment.serviceName}
      </Text>

      <View className="mt-1.5 flex-row items-center">
        <Feather color={colors.icon.muted} name="user" size={ICON_SIZE} />
        <Text className="ml-1.5 font-roboto text-sm text-zinc-400">
          {appointment.barberName} ·{" "}
          {formatDuration(appointment.durationInMinutes)}
        </Text>
      </View>

      <View className="my-4 h-px bg-zinc-800" />

      <View className="flex-row items-center">
        <View className="flex-row items-center">
          <Feather
            color={colors.icon.subtle}
            name="calendar"
            size={ICON_SIZE}
          />
          <Text className="ml-1.5 font-roboto-medium text-sm text-zinc-200">
            {formatAppointmentDate(appointment.scheduledAt)}
          </Text>
        </View>

        <View className="ml-5 flex-row items-center">
          <Feather color={colors.icon.subtle} name="clock" size={ICON_SIZE} />
          <Text className="ml-1.5 font-roboto-medium text-sm text-zinc-200">
            {formatAppointmentTime(appointment.scheduledAt)}
          </Text>
        </View>
      </View>

      <CancellationFooter
        onRequestCancel={handleRequestCancel}
        serviceName={appointment.serviceName}
        state={getCancellationState(appointment)}
      />
    </Animated.View>
  );
}
