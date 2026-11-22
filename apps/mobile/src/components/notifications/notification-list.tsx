import { View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import type { AppNotification } from "@/types/models";
import { NotificationCard } from "./notification-card";

interface NotificationListProps {
  hasLoadError: boolean;
  isLoading: boolean;
  notifications: AppNotification[];
  onOpenNotification: (notification: AppNotification) => void;
}

export function NotificationList({
  hasLoadError,
  isLoading,
  notifications,
  onOpenNotification,
}: NotificationListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (hasLoadError) {
    return <StateMessage {...LOAD_ERROR_MESSAGE} />;
  }

  if (notifications.length === 0) {
    return (
      <StateMessage
        description="Os avisos sobre os seus agendamentos aparecem aqui."
        icon="notifications-outline"
        title="Nenhuma notificação"
      />
    );
  }

  return (
    <View className="gap-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onPress={onOpenNotification}
        />
      ))}
    </View>
  );
}
