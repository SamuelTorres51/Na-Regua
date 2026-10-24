import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Text, View } from "react-native";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/models";
import { formatDuration, formatRelativeDate, formatTime } from "@/utils/format";
import { AppointmentStatusBadge } from "./appointment-status-badge";

const ICON_SIZE = 15;

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

interface AppointmentSummaryProps {
  appointment: Appointment;
  trailing: ReactNode;
}

export function AppointmentSummary({
  appointment,
  trailing,
}: AppointmentSummaryProps) {
  const { barber, service, startsAt, status } = appointment;

  return (
    <>
      <View className="flex-row items-center justify-between">
        <AppointmentStatusBadge status={status} />
        {trailing}
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
    </>
  );
}
