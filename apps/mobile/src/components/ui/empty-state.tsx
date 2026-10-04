import Feather from "@expo/vector-icons/Feather";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "@/theme/colors";

const FADE_DURATION = 320;
const ICON_SIZE = 26;

interface EmptyStateProps {
  description: string;
  icon: ComponentProps<typeof Feather>["name"];
  title: string;
}

export function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <Animated.View
      className="items-center px-6 py-14"
      entering={FadeIn.duration(FADE_DURATION)}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60">
        <Feather color={colors.icon.muted} name={icon} size={ICON_SIZE} />
      </View>
      <Text className="mt-5 text-center font-roboto-semibold text-lg text-zinc-200">
        {title}
      </Text>
      <Text className="mt-2 text-center font-roboto text-sm text-zinc-500 leading-5">
        {description}
      </Text>
    </Animated.View>
  );
}
