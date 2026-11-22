import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon, type IconName, type IconTone } from "@/components/ui/icon";
import { classNames } from "@/theme/class-names";
import type { AppNotification, NotificationKind } from "@/types/models";
import { formatRelativeDate, formatTime } from "@/utils/format";

const FADE_DURATION = 280;
const UNREAD_CARD_CLASS_NAME = "rounded-3xl border border-brand/30 bg-zinc-900";

interface KindAppearance {
  badgeClassName: string;
  icon: IconName;
  title: string;
  tone: IconTone;
}

const KIND_APPEARANCES: Record<NotificationKind, KindAppearance> = {
  cancellation: {
    badgeClassName: "bg-red-500/10",
    icon: "close-circle-outline",
    title: "Horário cancelado",
    tone: "danger",
  },
  confirmation: {
    badgeClassName: "bg-green-500/10",
    icon: "checkmark-circle-outline",
    title: "Horário agendado",
    tone: "success",
  },
  general: {
    badgeClassName: "bg-zinc-800/80",
    icon: "notifications-outline",
    title: "Aviso",
    tone: "subtle",
  },
  reminder: {
    badgeClassName: "bg-brand/15",
    icon: "alarm-outline",
    title: "Lembrete de horário",
    tone: "accent",
  },
};

function formatSentAt(sentAt: string) {
  return `${formatRelativeDate(sentAt)} às ${formatTime(sentAt)}`;
}

function describeNotification({ isRead, message }: AppNotification) {
  return isRead ? message : `Não lida. ${message}`;
}

interface NotificationCardProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

export function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const { badgeClassName, icon, title, tone } =
    KIND_APPEARANCES[notification.kind];

  const handlePress = useCallback(
    () => onPress(notification),
    [notification, onPress]
  );

  return (
    <Animated.View entering={FadeIn.duration(FADE_DURATION)}>
      <Pressable
        accessibilityHint={
          notification.appointmentId ? "Abre seus agendamentos." : undefined
        }
        accessibilityLabel={`${title}. ${describeNotification(notification)}`}
        accessibilityRole="button"
        className={`flex-row p-5 active:opacity-80 ${notification.isRead ? classNames.card : UNREAD_CARD_CLASS_NAME}`}
        onPress={handlePress}
      >
        <View
          className={`h-11 w-11 items-center justify-center rounded-full ${badgeClassName}`}
        >
          <Icon name={icon} tone={tone} />
        </View>

        <View className="ml-4 flex-1">
          <View className="flex-row items-center">
            <Text className="flex-1 font-roboto-semibold text-base text-white">
              {title}
            </Text>
            {notification.isRead ? null : (
              <View className="ml-3 h-2.5 w-2.5 rounded-full bg-brand" />
            )}
          </View>
          <Text
            className={`mt-1 font-roboto text-sm leading-5 ${notification.isRead ? "text-zinc-400" : "text-zinc-300"}`}
          >
            {notification.message}
          </Text>
          <Text className="mt-2 font-roboto text-xs text-zinc-500">
            {formatSentAt(notification.sentAt)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
