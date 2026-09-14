import { Stack } from "expo-router";
import { colors } from "@/theme/colors";

export const unstable_settings = { initialRouteName: "(tabs)" };

export default function AppLayout() {
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
