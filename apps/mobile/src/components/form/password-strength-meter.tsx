import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";
import { MAX_PASSWORD_SCORE, PASSWORD_SCORE_LABELS } from "@/utils/password";

const FULL_WIDTH = 100;
const LABEL_FADE_DURATION = 200;
const METER_DURATION = 280;
const SCORE_STEPS = [0, 1, 2, 3, 4];

interface PasswordStrengthMeterProps {
  score: number;
}

export function PasswordStrengthMeter({ score }: PasswordStrengthMeterProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score, { duration: METER_DURATION });
  }, [progress, score]);

  const barStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      SCORE_STEPS,
      colors.strength
    ),
    width: `${(progress.value / MAX_PASSWORD_SCORE) * FULL_WIDTH}%`,
  }));

  return (
    <View className="mt-3">
      <View className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <Animated.View className="h-full rounded-full" style={barStyle} />
      </View>

      {score > 0 ? (
        <Animated.Text
          className="mt-2 font-roboto text-xs text-zinc-500"
          entering={FadeIn.duration(LABEL_FADE_DURATION)}
          key={score}
        >
          Força da senha: {PASSWORD_SCORE_LABELS[score]}
        </Animated.Text>
      ) : null}
    </View>
  );
}
