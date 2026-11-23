import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon } from "@/components/ui/icon";
import type { AppNotification } from "@/types/models";

const FADE_DURATION = 280;
const SEVERAL_CANCELLATIONS_DESCRIPTION =
  "Toque para ver os detalhes nas notificações.";

interface CancellationAlertProps {
  cancellations: AppNotification[];
  onPress: () => void;
}

function describeCancellations(cancellations: AppNotification[]) {
  const [latest] = cancellations;

  if (cancellations.length === 1 && latest) {
    return {
      description: latest.message,
      title: "A barbearia cancelou seu horário",
    };
  }

  return {
    description: SEVERAL_CANCELLATIONS_DESCRIPTION,
    title: `A barbearia cancelou ${cancellations.length} horários`,
  };
}

export function CancellationAlert({
  cancellations,
  onPress,
}: CancellationAlertProps) {
  const { description, title } = describeCancellations(cancellations);

  return (
    <Animated.View entering={FadeIn.duration(FADE_DURATION)}>
      <Pressable
        accessibilityHint="Abre suas notificações."
        accessibilityLabel={`${title}. ${description}`}
        accessibilityRole="button"
        className="flex-row items-center rounded-3xl border border-red-500/25 bg-red-500/10 p-5 active:opacity-80"
        onPress={onPress}
      >
        <View className="h-11 w-11 items-center justify-center rounded-full bg-red-500/15">
          <Icon name="close-circle-outline" tone="danger" />
        </View>
        <View className="mr-3 ml-4 flex-1">
          <Text className="font-roboto-semibold text-base text-red-200">
            {title}
          </Text>
          <Text className="mt-1 font-roboto text-sm text-zinc-300 leading-5">
            {description}
          </Text>
        </View>
        <Icon name="chevron-forward" size="sm" tone="muted" />
      </Pressable>
    </Animated.View>
  );
}
