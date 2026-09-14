import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider, useSession } from "@/features/auth/session-provider";
import { useAppFonts } from "@/hooks/use-app-fonts";
import { useSplashScreen } from "@/hooks/use-splash-screen";

function RootNavigator() {
  const { isLoading, session } = useSession();
  const areFontsReady = useAppFonts();
  const isReady = areFontsReady && !isLoading;

  useSplashScreen(isReady);

  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ animation: "fade", headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
