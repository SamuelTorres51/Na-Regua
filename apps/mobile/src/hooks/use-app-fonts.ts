import { useFonts } from "expo-font";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { useEffect } from "react";
import { appFonts } from "@/theme/fonts";

preventAutoHideAsync();

export function useAppFonts() {
  const [isLoaded, loadError] = useFonts(appFonts);
  const isReady = isLoaded || loadError !== null;

  useEffect(() => {
    if (isReady) {
      hideAsync();
    }
  }, [isReady]);

  return isReady;
}
