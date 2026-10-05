import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { useEffect } from "react";

preventAutoHideAsync();

export function useSplashScreen(isReady: boolean) {
  useEffect(() => {
    if (isReady) {
      hideAsync();
    }
  }, [isReady]);
}
