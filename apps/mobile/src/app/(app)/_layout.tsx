import { Stack } from "expo-router";
import { useReminderSync } from "@/features/reminders/use-reminder-sync";
import { colors } from "@/theme/colors";

export const unstable_settings = { initialRouteName: "(tabs)" };

export default function AppLayout() {
  useReminderSync();

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
        headerShown: false,
      }}
    />
  );
}
