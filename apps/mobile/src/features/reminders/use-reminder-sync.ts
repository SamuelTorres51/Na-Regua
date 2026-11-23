import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  getLastNotificationResponse,
  type NotificationResponse,
} from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import { refreshAppointmentReminders } from "@/services/appointment-reminders";
import { registerReminderTask } from "./reminder-task";

function isReminderResponse(response: NotificationResponse | null) {
  return (
    typeof response?.notification.request.content.data?.appointmentId ===
    "string"
  );
}

function refreshReminders() {
  refreshAppointmentReminders().catch(() => undefined);
}

export function useReminderSync() {
  const router = useRouter();

  useEffect(() => {
    registerReminderTask().catch(() => undefined);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshReminders();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    function handleResponse(response: NotificationResponse | null) {
      if (!isReminderResponse(response)) {
        return;
      }

      clearLastNotificationResponse();
      router.navigate("/appointments");
    }

    handleResponse(getLastNotificationResponse());

    const subscription =
      addNotificationResponseReceivedListener(handleResponse);

    return () => subscription.remove();
  }, [router]);
}
