import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon } from "./icon";

const FADE_DURATION = 400;

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
        <Icon name="arrow-back" size="lg" />
      </Pressable>
    </Animated.View>
  );
}
