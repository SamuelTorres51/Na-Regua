import { Stack } from "expo-router";

export const unstable_settings = { initialRouteName: "welcome" };

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{ animation: "slide_from_right", headerShown: false }}
    />
  );
}
