import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon, type IconName } from "@/components/ui/icon";
import { classNames } from "@/theme/class-names";

const FADE_DURATION = 320;

export interface StateMessageContent {
  description: string;
  icon: IconName;
  title: string;
}

interface StateMessageProps extends StateMessageContent {
  variant?: "card" | "page";
}

export const LOAD_ERROR_MESSAGE: StateMessageContent = {
  description: "Puxe a tela para baixo para tentar de novo.",
  icon: "cloud-offline-outline",
  title: "Não foi possível carregar",
};

export function StateMessage({
  description,
  icon,
  title,
  variant = "page",
}: StateMessageProps) {
  if (variant === "card") {
    return (
      <Animated.View
        className={`flex-row items-center p-5 ${classNames.card}`}
        entering={FadeIn.duration(FADE_DURATION)}
      >
        <View className="h-11 w-11 items-center justify-center rounded-full bg-zinc-800/80">
          <Icon name={icon} size="lg" tone="muted" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-roboto-semibold text-base text-zinc-200">
            {title}
          </Text>
          <Text className="mt-0.5 font-roboto text-sm text-zinc-500">
            {description}
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      className="items-center px-6 py-14"
      entering={FadeIn.duration(FADE_DURATION)}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60">
        <Icon name={icon} size="xl" tone="muted" />
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
