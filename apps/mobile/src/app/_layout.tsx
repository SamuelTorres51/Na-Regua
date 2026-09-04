import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Roboto-Bold": require("../../assets/fonts/roboto/Roboto-Bold.ttf"),
    "Roboto-Medium": require("../../assets/fonts/roboto/Roboto-Medium.ttf"),
    "Roboto-Regular": require("../../assets/fonts/roboto/Roboto-Regular.ttf"),
    "Roboto-SemiBold": require("../../assets/fonts/roboto/Roboto-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!(fontsLoaded || fontError)) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
      </Stack>
    </SafeAreaProvider>
  );
}
