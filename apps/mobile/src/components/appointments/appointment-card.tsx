import Ionicons from "@expo/vector-icons/Ionicons";
import { type ComponentProps, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import {
  type CancellationState,
  getCancellationState,
  MIN_CANCEL_NOTICE_MINUTES,
} from "@/features/appointments/cancellation";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/models";
import {
  formatDuration,
  formatPrice,
  formatRelativeDate,
  formatTime,
} from "@/utils/format";
import { AppointmentStatusBadge } from "./appointment-status-badge";

const FADE_DURATION = 280;
const ICON_SIZE = 15;
const ACTION_ICON_SIZE = 17;

const DETAIL_TONES = {
  muted: {
    iconColor: colors.icon.muted,
    textClassName: "font-roboto text-zinc-400",
  },
  strong: {
    iconColor: colors.icon.subtle,
    textClassName: "font-roboto-medium text-zinc-200",
  },
} as const;

interface DetailProps {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  tone: keyof typeof DETAIL_TONES;
}

function Detail({ icon, label, tone }: DetailProps) {
  const { iconColor, textClassName } = DETAIL_TONES[tone];

  return (
    <View className="flex-row items-center">
      <Ionicons color={iconColor} name={icon} size={ICON_SIZE} />
      <Text className={`ml-1.5 text-sm ${textClassName}`}>{label}</Text>
    </View>
  );
}

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
  const { barber, service, startsAt, status } = appointment;

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
      <View className="flex-row items-center justify-between">
        <AppointmentStatusBadge status={status} />
        <Text className="font-roboto-semibold text-base text-white">
          {formatPrice(service.priceInCents)}
        </Text>
      </View>

      <Text className="mt-4 font-roboto-semibold text-white text-xl">
        {service.name}
      </Text>

      <View className="mt-1.5">
        <Detail
          icon="person-outline"
          label={`${barber.name} · ${formatDuration(service.durationMinutes)}`}
          tone="muted"
        />
      </View>

      <View className="my-4 h-px bg-zinc-800" />

      <View className="flex-row items-center gap-5">
        <Detail
          icon="calendar-outline"
          label={formatRelativeDate(startsAt)}
          tone="strong"
        />
        <Detail
          icon="time-outline"
          label={formatTime(startsAt)}
          tone="strong"
        />
      </View>

      <CancellationFooter
        onRequestCancel={handleRequestCancel}
        serviceName={service.name}
        state={getCancellationState(appointment)}
      />
    </Animated.View>
  );
}
