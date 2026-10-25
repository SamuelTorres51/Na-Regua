import { Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon } from "@/components/ui/icon";

const FADE_DURATION = 220;

interface FormAlertProps {
  message: string | null;
}

export function FormAlert({ message }: FormAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className="mb-4 flex-row items-center rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3"
      entering={FadeIn.duration(FADE_DURATION)}
    >
      <Icon name="alert-circle" tone="danger" />
      <Text className="ml-3 flex-1 font-roboto text-red-200 text-sm">
        {message}
      </Text>
    </Animated.View>
  );
}
