import { useQueryData } from "@/hooks/use-query-data";
import { listNotifications } from "@/services/notifications";
import type { AppNotification } from "@/types/models";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

const NO_NOTIFICATIONS: AppNotification[] = [];

export function useNotificationList() {
  return useQueryData(
    NOTIFICATIONS_QUERY_KEY,
    listNotifications,
    NO_NOTIFICATIONS
  );
}
