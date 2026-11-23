import {
  BackgroundTaskResult,
  BackgroundTaskStatus,
  getStatusAsync,
  registerTaskAsync,
  unregisterTaskAsync,
} from "expo-background-task";
import { defineTask, isTaskRegisteredAsync } from "expo-task-manager";
import { setAccessToken } from "@/services/api-client";
import {
  cancelAllAppointmentReminders,
  refreshAppointmentReminders,
} from "@/services/appointment-reminders";
import { loadSession } from "@/services/session-storage";

const REMINDER_TASK_NAME = "naregua.appointment-reminders";
const REMINDER_TASK_INTERVAL_MINUTES = 15;

defineTask(REMINDER_TASK_NAME, async () => {
  try {
    const session = await loadSession();

    if (session) {
      setAccessToken(session.token);
      await refreshAppointmentReminders();
    }

    return BackgroundTaskResult.Success;
  } catch {
    return BackgroundTaskResult.Failed;
  }
});

export async function registerReminderTask() {
  const status = await getStatusAsync();

  if (
    status !== BackgroundTaskStatus.Available ||
    (await isTaskRegisteredAsync(REMINDER_TASK_NAME))
  ) {
    return;
  }

  await registerTaskAsync(REMINDER_TASK_NAME, {
    minimumInterval: REMINDER_TASK_INTERVAL_MINUTES,
  });
}

async function unregisterReminderTask() {
  if (await isTaskRegisteredAsync(REMINDER_TASK_NAME)) {
    await unregisterTaskAsync(REMINDER_TASK_NAME);
  }
}

export async function stopAppointmentReminders() {
  await Promise.allSettled([
    cancelAllAppointmentReminders(),
    unregisterReminderTask(),
  ]);
}
