import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppFonts } from "@/hooks/use-app-fonts";

export default function RootLayout() {
  const areFontsReady = useAppFonts();

  if (!areFontsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
