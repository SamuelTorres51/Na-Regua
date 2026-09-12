import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";

const BASE_SCALE = 0.92;
const CHECKBOX_DURATION = 180;
const ERROR_FADE_DURATION = 220;
const SCALE_RANGE = 0.08;
const TRANSPARENT_ACCENT = "rgba(245, 158, 11, 0)";

interface TermsCheckboxProps {
  error?: string;
  isChecked: boolean;
  onToggle: () => void;
}

export function TermsCheckbox({
  error,
  isChecked,
  onToggle,
}: TermsCheckboxProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Number(isChecked), {
      duration: CHECKBOX_DURATION,
    });
  }, [isChecked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [TRANSPARENT_ACCENT, colors.accent]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border.idle, colors.border.focused]
    ),
    transform: [{ scale: BASE_SCALE + progress.value * SCALE_RANGE }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <View>
      <Pressable
        accessibilityLabel="Aceitar os termos de uso"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
        className="mt-6 flex-row items-center active:opacity-70"
        hitSlop={6}
        onPress={onToggle}
      >
        <Animated.View
          className="h-6 w-6 items-center justify-center rounded-lg border"
          style={boxStyle}
        >
          <Animated.Text
            className="font-roboto-bold text-sm text-zinc-950"
            style={checkStyle}
          >
            ✓
          </Animated.Text>
        </Animated.View>

        <Text className="ml-3 flex-1 font-roboto text-sm text-zinc-400">
          Li e aceito os termos de uso e a política de privacidade.
        </Text>
      </Pressable>

      {error ? (
        <Animated.Text
          className="mt-2 font-roboto text-danger text-xs"
          entering={FadeIn.duration(ERROR_FADE_DURATION)}
        >
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}
