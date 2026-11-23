import { useMemo } from "react";
import { useRefocusEffect } from "@/hooks/use-refocus-effect";
import { useNotificationList } from "./use-notification-list";

export function useNotificationsSummary() {
  const { data: notifications, refresh } = useNotificationList();

  useRefocusEffect(refresh);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications]
  );

  const unreadCancellations = useMemo(
    () =>
      unreadNotifications.filter(
        (notification) => notification.kind === "cancellation"
      ),
    [unreadNotifications]
  );

  return {
    refresh,
    unreadCancellations,
    unreadCount: unreadNotifications.length,
  };
}
