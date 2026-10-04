import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "@/theme/colors";

const FADE_DURATION = 400;
const ICON_SIZE = 22;

export function BackButton() {
  const router = useRouter();

  return (
    <Animated.View entering={FadeIn.duration(FADE_DURATION)}>
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center rounded-full border border-zinc-800 active:opacity-60"
        hitSlop={8}
        onPress={router.back}
      >
        <Ionicons
          color={colors.icon.primary}
          name="arrow-back"
          size={ICON_SIZE}
        />
      </Pressable>
    </Animated.View>
  );
}
