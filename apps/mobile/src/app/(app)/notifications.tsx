import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScrollScreen } from "@/components/layout/scroll-screen";
import { NotificationList } from "@/components/notifications/notification-list";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextLink } from "@/components/ui/text-link";
import { useNotifications } from "@/features/notifications/use-notifications";

const LIST_DELAY = 260;
const LIST_DURATION = 600;

function describeUnreadCount(unreadCount: number) {
  if (unreadCount === 0) {
    return "Avisos sobre os seus agendamentos.";
  }

  return unreadCount === 1
    ? "Você tem 1 aviso não lido."
    : `Você tem ${unreadCount} avisos não lidos.`;
}

export default function Notifications() {
  const {
    handleMarkAllAsRead,
    handleOpenNotification,
    hasLoadError,
    isLoading,
    isRefreshing,
    notifications,
    refresh,
    unreadCount,
  } = useNotifications();

  return (
    <ScrollScreen isRefreshing={isRefreshing} onRefresh={refresh}>
      <View className="px-6">
        <BackButton />

        <ScreenHeader
          subtitle={describeUnreadCount(unreadCount)}
          title="Notificações"
        />

        <Animated.View
          className="mt-8"
          entering={FadeInDown.delay(LIST_DELAY).duration(LIST_DURATION)}
        >
          {unreadCount > 0 ? (
            <View className="mb-4 flex-row justify-end">
              <TextLink
                accessibilityLabel="Marcar todas as notificações como lidas"
                label="Marcar todas como lidas"
                onPress={handleMarkAllAsRead}
              />
            </View>
          ) : null}

          <NotificationList
            hasLoadError={hasLoadError}
            isLoading={isLoading}
            notifications={notifications}
            onOpenNotification={handleOpenNotification}
          />
        </Animated.View>
      </View>
    </ScrollScreen>
  );
}
