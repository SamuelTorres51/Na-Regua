import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { STATUS_LABELS } from "@/features/appointments/status";
import { colors } from "@/theme/colors";
import type { AppointmentStatus } from "@/types/models";

const PULSE_DURATION = 800;
const PULSE_MIN_OPACITY = 0.25;
// Sufixo hexadecimal de opacidade (~15%) aplicado à cor do status no fundo.
const BACKGROUND_ALPHA = "26";

interface PulsingDotProps {
  color: string;
}

// Indica "acontecendo agora" no status Em atendimento.
function PulsingDot({ color }: PulsingDotProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(PULSE_MIN_OPACITY, { duration: PULSE_DURATION }),
      -1,
      true
    );

    return () => cancelAnimation(opacity);
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className="h-1.5 w-1.5 rounded-full"
      style={[{ backgroundColor: color }, pulseStyle]}
    />
  );
}

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const color = colors.status[status];

  return (
    <View
      className="flex-row items-center self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: `${color}${BACKGROUND_ALPHA}` }}
    >
      {status === "inProgress" ? (
        <PulsingDot color={color} />
      ) : (
        <View
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <Text className="ml-1.5 font-roboto-medium text-xs" style={{ color }}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
