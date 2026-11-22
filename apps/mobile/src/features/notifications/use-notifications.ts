import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useQueryData } from "@/hooks/use-query-data";
import {
  listNotifications,
  markNotificationAsRead,
} from "@/services/notifications";
import type { AppNotification } from "@/types/models";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

const NO_NOTIFICATIONS: AppNotification[] = [];

export function useNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: notifications,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useQueryData(
    NOTIFICATIONS_QUERY_KEY,
    listNotifications,
    NO_NOTIFICATIONS
  );

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

      if (notification.appointmentId) {
        router.navigate("/appointments");
      }
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
