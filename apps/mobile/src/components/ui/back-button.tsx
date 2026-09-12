import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

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
        <Text className="font-roboto-medium text-white text-xl">←</Text>
      </Pressable>
    </Animated.View>
  );
}
