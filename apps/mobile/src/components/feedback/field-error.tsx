import Animated, { FadeIn } from "react-native-reanimated";

const FADE_DURATION = 220;

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <Animated.Text
      accessibilityLiveRegion="polite"
      className="mt-2 font-roboto text-danger text-xs"
      entering={FadeIn.duration(FADE_DURATION)}
    >
      {message}
    </Animated.Text>
  );
}
