import { Text, View } from "react-native";
import { IconButton } from "@/components/ui/icon-button";

const MAX_VISIBLE_COUNT = 9;

interface NotificationBellProps {
  onPress: () => void;
  unreadCount: number;
}

function describeUnreadCount(unreadCount: number) {
  if (unreadCount === 0) {
    return "Notificações";
  }

  return unreadCount === 1
    ? "Notificações, 1 não lida"
    : `Notificações, ${unreadCount} não lidas`;
}

function formatUnreadCount(unreadCount: number) {
  return unreadCount > MAX_VISIBLE_COUNT
    ? `${MAX_VISIBLE_COUNT}+`
    : String(unreadCount);
}

export function NotificationBell({
  onPress,
  unreadCount,
}: NotificationBellProps) {
  const hasUnread = unreadCount > 0;

  return (
    <View>
      <IconButton
        accessibilityLabel={describeUnreadCount(unreadCount)}
        icon={hasUnread ? "notifications" : "notifications-outline"}
        onPress={onPress}
      />
      {hasUnread ? (
        <View className="pointer-events-none absolute -top-1 -right-1 h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-zinc-950 bg-brand px-1">
          <Text className="font-roboto-bold text-[10px] text-zinc-950">
            {formatUnreadCount(unreadCount)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
