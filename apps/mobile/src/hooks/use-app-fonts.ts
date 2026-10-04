import { useFonts } from "expo-font";
import { appFonts } from "@/theme/fonts";

export function useAppFonts() {
  const [isLoaded, loadError] = useFonts(appFonts);
  return isLoaded || loadError !== null;
}
