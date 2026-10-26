import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { IconButton } from "./icon-button";

const FADE_DURATION = 400;

export function BackButton() {
  const router = useRouter();

  return (
    <Animated.View entering={FadeIn.duration(FADE_DURATION)}>
      <IconButton
        accessibilityLabel="Voltar"
        icon="arrow-back"
        onPress={router.back}
      />
    </Animated.View>
  );
}
