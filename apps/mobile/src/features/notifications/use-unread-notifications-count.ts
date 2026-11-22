import { useQueryData } from "@/hooks/use-query-data";
import { useRefocusEffect } from "@/hooks/use-refocus-effect";
import { countUnreadNotifications } from "@/services/notifications";
import { NOTIFICATIONS_QUERY_KEY } from "./use-notifications";

const UNREAD_COUNT_QUERY_KEY = [
  ...NOTIFICATIONS_QUERY_KEY,
  "unread-count",
] as const;

export function useUnreadNotificationsCount() {
  const { data: unreadCount, refresh } = useQueryData(
    UNREAD_COUNT_QUERY_KEY,
    countUnreadNotifications,
    0
  );

  useRefocusEffect(refresh);

  return { refresh, unreadCount };
}
