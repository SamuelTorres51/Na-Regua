import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import type { AppointmentsTab } from "@/features/appointments/tabs";
import { markNotificationAsRead } from "@/services/notifications";
import type { AppNotification } from "@/types/models";
import {
  NOTIFICATIONS_QUERY_KEY,
  useNotificationList,
} from "./use-notification-list";

const CANCELLATION_TAB: AppointmentsTab = "history";

export function useNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: notifications,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useNotificationList();

  const unreadIds = useMemo(
    () =>
      notifications
        .filter((notification) => !notification.isRead)
        .map((notification) => notification.id),
    [notifications]
  );

  const markAsRead = useCallback(
    async (notificationIds: readonly string[]) => {
      await queryClient.cancelQueries({
        exact: true,
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });

      queryClient.setQueryData<AppNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
        (current) =>
          current?.map((notification) =>
            notificationIds.includes(notification.id)
              ? { ...notification, isRead: true }
              : notification
          )
      );

      await Promise.allSettled(notificationIds.map(markNotificationAsRead));
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });
    },
    [queryClient]
  );

  const handleOpenNotification = useCallback(
    (notification: AppNotification) => {
      if (!notification.isRead) {
        markAsRead([notification.id]);
      }

      if (!notification.appointmentId) {
        return;
      }

      if (notification.kind === "cancellation") {
        router.navigate({
          params: { tab: CANCELLATION_TAB },
          pathname: "/appointments",
        });
        return;
      }

      router.navigate("/appointments");
    },
    [markAsRead, router]
  );

  const handleMarkAllAsRead = useCallback(
    () => markAsRead(unreadIds),
    [markAsRead, unreadIds]
  );

  return {
    handleMarkAllAsRead,
    handleOpenNotification,
    hasLoadError,
    isLoading,
    isRefreshing,
    notifications,
    refresh,
    unreadCount: unreadIds.length,
  };
}
