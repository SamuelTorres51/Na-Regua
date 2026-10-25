import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Appointment } from "@/types/models";
import { formatDuration, formatRelativeDate, formatTime } from "@/utils/format";
import { AppointmentStatusBadge } from "./appointment-status-badge";

const DETAIL_TONES = {
  muted: {
    iconTone: "muted",
    textClassName: "font-roboto text-zinc-400",
  },
  strong: {
    iconTone: "subtle",
    textClassName: "font-roboto-medium text-zinc-200",
  },
} as const;

interface DetailProps {
  icon: IconName;
  label: string;
  tone: keyof typeof DETAIL_TONES;
}

function Detail({ icon, label, tone }: DetailProps) {
  const { iconTone, textClassName } = DETAIL_TONES[tone];

  return (
    <View className="flex-row items-center">
      <Icon name={icon} size="sm" tone={iconTone} />
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
