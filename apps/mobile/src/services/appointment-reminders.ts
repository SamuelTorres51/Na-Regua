import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  type NotificationPermissionsStatus,
  type NotificationRequest,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from "expo-notifications";
import type { Appointment, AppointmentStatus } from "@/types/models";
import { formatTime } from "@/utils/format";
import { listAppointments } from "./appointments";

const REMINDER_CHANNEL_ID = "appointment-reminders";
const REMINDER_ID_PREFIX = "appointment-reminder-";
const REMINDER_LEAD_MINUTES = 60;
const MS_PER_MINUTE = 60_000;

const REMINDABLE_STATUSES: readonly AppointmentStatus[] = [
  "confirmed",
  "scheduled",
];

export type ReminderPermission = "blocked" | "granted" | "undetermined";

let channelSetup: Promise<unknown> | null = null;
let pendingTask: Promise<void> = Promise.resolve();

function ensureReminderChannel() {
  channelSetup ??= setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    importance: AndroidImportance.HIGH,
    name: "Lembretes de horário",
  });

  return channelSetup;
}

function enqueue(task: () => Promise<void>) {
  pendingTask = pendingTask.then(task).catch(() => undefined);

  return pendingTask;
}

export function configureReminderNotifications() {
  setNotificationHandler({
    handleNotification: () =>
      Promise.resolve({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
  });
  ensureReminderChannel();
}

function toReminderPermission({
  canAskAgain,
  granted,
}: NotificationPermissionsStatus): ReminderPermission {
  if (granted) {
    return "granted";
  }

  return canAskAgain ? "undetermined" : "blocked";
}

export async function getReminderPermission() {
  return toReminderPermission(await getPermissionsAsync());
}

export async function requestReminderPermission() {
  await ensureReminderChannel();
  const current = await getPermissionsAsync();

  if (current.granted || !current.canAskAgain) {
    return toReminderPermission(current);
  }

  return toReminderPermission(await requestPermissionsAsync());
}

function getReminderTime(startsAt: string) {
  return new Date(startsAt).getTime() - REMINDER_LEAD_MINUTES * MS_PER_MINUTE;
}

export function canRemindBefore(startsAt: string, now = Date.now()) {
  return getReminderTime(startsAt) > now;
}

function getReminderId(appointmentId: string) {
  return `${REMINDER_ID_PREFIX}${appointmentId}`;
}

function isReminder({ identifier }: NotificationRequest) {
  return identifier.startsWith(REMINDER_ID_PREFIX);
}

function shouldRemind({ startsAt, status }: Appointment, now: number) {
  return REMINDABLE_STATUSES.includes(status) && canRemindBefore(startsAt, now);
}

function isUpToDate(
  { content }: NotificationRequest,
  appointment: Appointment | undefined
) {
  return (
    appointment !== undefined && content.data?.startsAt === appointment.startsAt
  );
}

function scheduleReminder(
  identifier: string,
  { barber, id, service, startsAt }: Appointment
) {
  return scheduleNotificationAsync({
    content: {
      body: `${service.name} com ${barber.name} às ${formatTime(startsAt)}. Até já!`,
      data: { appointmentId: id, startsAt },
      title: "Seu horário é daqui a 1 hora",
    },
    identifier,
    trigger: {
      channelId: REMINDER_CHANNEL_ID,
      date: getReminderTime(startsAt),
      type: SchedulableTriggerInputTypes.DATE,
    },
  });
}

async function listScheduledReminders() {
  const scheduled = await getAllScheduledNotificationsAsync();

  return scheduled.filter(isReminder);
}

async function applyReminders(appointments: Appointment[]) {
  if ((await getReminderPermission()) !== "granted") {
    return;
  }

  await ensureReminderChannel();

  const now = Date.now();
  const remindable = new Map(
    appointments
      .filter((appointment) => shouldRemind(appointment, now))
      .map((appointment) => [getReminderId(appointment.id), appointment])
  );
  const scheduled = await listScheduledReminders();
  const upToDateIds = new Set(
    scheduled
      .filter((request) =>
        isUpToDate(request, remindable.get(request.identifier))
      )
      .map((request) => request.identifier)
  );

  await Promise.all(
    scheduled
      .filter((request) => !upToDateIds.has(request.identifier))
      .map((request) => cancelScheduledNotificationAsync(request.identifier))
  );
  await Promise.all(
    [...remindable]
      .filter(([identifier]) => !upToDateIds.has(identifier))
      .map(([identifier, appointment]) =>
        scheduleReminder(identifier, appointment)
      )
  );
}

async function removeAllReminders() {
  const scheduled = await listScheduledReminders();

  await Promise.all(
    scheduled.map((request) =>
      cancelScheduledNotificationAsync(request.identifier)
    )
  );
}

export function syncAppointmentReminders(appointments: Appointment[]) {
  return enqueue(() => applyReminders(appointments));
}

export async function refreshAppointmentReminders() {
  if ((await getReminderPermission()) !== "granted") {
    return;
  }

  await syncAppointmentReminders(await listAppointments());
}

export function cancelAppointmentReminder(appointmentId: string) {
  return enqueue(() =>
    cancelScheduledNotificationAsync(getReminderId(appointmentId))
  );
}

export function cancelAllAppointmentReminders() {
  return enqueue(removeAllReminders);
}
