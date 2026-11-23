import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import {
  getReminderPermission,
  type ReminderPermission,
  refreshAppointmentReminders,
  requestReminderPermission,
} from "@/services/appointment-reminders";

const FALLBACK_PERMISSION: ReminderPermission = "blocked";

function refreshReminders() {
  refreshAppointmentReminders().catch(() => undefined);
}

export function useReminderPermission() {
  const [permission, setPermission] = useState<ReminderPermission | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const updatePermission = useCallback((nextPermission: ReminderPermission) => {
    setPermission(nextPermission);

    if (nextPermission === "granted") {
      refreshReminders();
    }
  }, []);

  const checkPermission = useCallback(async () => {
    updatePermission(
      await getReminderPermission().catch(() => FALLBACK_PERMISSION)
    );
  }, [updatePermission]);

  useEffect(() => {
    checkPermission();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkPermission();
      }
    });

    return () => subscription.remove();
  }, [checkPermission]);

  const handleEnableReminders = useCallback(async () => {
    setIsRequesting(true);
    updatePermission(
      await requestReminderPermission().catch(() => FALLBACK_PERMISSION)
    );
    setIsRequesting(false);
  }, [updatePermission]);

  const handleOpenSettings = useCallback(() => Linking.openSettings(), []);

  return {
    handleEnableReminders,
    handleOpenSettings,
    isRequesting,
    permission,
  };
}
