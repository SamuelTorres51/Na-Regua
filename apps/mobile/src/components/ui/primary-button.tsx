import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated from "react-native-reanimated";
import { usePressScale } from "@/hooks/use-press-scale";
import { colors } from "@/theme/colors";

const TONE_CLASSES = {
  brand: "bg-brand",
  danger: "bg-danger",
} as const;

interface PrimaryButtonProps {
  accessibilityLabel: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  label: string;
  onPress: () => void;
  tone?: keyof typeof TONE_CLASSES;
}

export function PrimaryButton({
  accessibilityLabel,
  isDisabled = false,
  isLoading = false,
  label,
  onPress,
  tone = "brand",
}: PrimaryButtonProps) {
  const { animatedStyle, handlePressIn, handlePressOut } = usePressScale();
  const isInactive = isDisabled || isLoading;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ busy: isLoading, disabled: isInactive }}
        className={`h-14 items-center justify-center rounded-2xl active:opacity-90 ${TONE_CLASSES[tone]} ${isDisabled ? "opacity-40" : ""}`}
        disabled={isInactive}
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
