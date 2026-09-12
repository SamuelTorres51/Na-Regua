import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const DEFAULT_DELAY = 120;
const DURATION = 700;

interface ScreenHeaderProps {
  delay?: number;
  subtitle: string;
  title: string;
}

export function ScreenHeader({
  delay = DEFAULT_DELAY,
  subtitle,
  title,
}: ScreenHeaderProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(DURATION)}>
      <View className="mt-8 h-1 w-12 rounded-full bg-brand" />
      <Text className="mt-6 font-roboto-bold text-4xl text-white leading-[1.1]">
        {title}
      </Text>
      <Text className="mt-3 font-roboto text-base text-zinc-400">
        {subtitle}
      </Text>
    </Animated.View>
  );
}
