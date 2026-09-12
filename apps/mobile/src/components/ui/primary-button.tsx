import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated from "react-native-reanimated";
import { usePressScale } from "@/hooks/use-press-scale";
import { colors } from "@/theme/colors";

interface PrimaryButtonProps {
  accessibilityLabel: string;
  isLoading?: boolean;
  label: string;
  onPress: () => void;
}

export function PrimaryButton({
  accessibilityLabel,
  isLoading = false,
  label,
  onPress,
}: PrimaryButtonProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = usePressScale();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ busy: isLoading, disabled: isLoading }}
        className="h-14 items-center justify-center rounded-2xl bg-brand active:opacity-90"
        disabled={isLoading}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.accentContrast} />
        ) : (
          <Text className="font-roboto-semibold text-base text-zinc-950">
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
