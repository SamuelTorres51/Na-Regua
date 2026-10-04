import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { STATUS_LABELS } from "@/features/appointments/appointment-status";
import type { AppointmentStatus } from "@/features/appointments/types";

const PULSE_DURATION = 800;
const PULSE_MIN_OPACITY = 0.25;

interface BadgeAppearance {
  container: string;
  dot: string;
  text: string;
}

const APPEARANCES: Record<AppointmentStatus, BadgeAppearance> = {
  cancelled: {
    container: "bg-red-500/15",
    dot: "bg-red-400",
    text: "text-red-300",
  },
  completed: {
    container: "bg-emerald-500/15",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
  },
  confirmed: {
    container: "bg-amber-500/15",
    dot: "bg-amber-400",
    text: "text-amber-300",
  },
  inProgress: {
    container: "bg-sky-500/15",
    dot: "bg-sky-400",
    text: "text-sky-300",
  },
  missed: {
    container: "bg-orange-500/15",
    dot: "bg-orange-400",
    text: "text-orange-300",
  },
  scheduled: {
    container: "bg-zinc-500/15",
    dot: "bg-zinc-400",
    text: "text-zinc-300",
  },
};

interface PulsingDotProps {
  className: string;
}

// Indica "acontecendo agora" no status Em atendimento.
function PulsingDot({ className }: PulsingDotProps) {
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

  return <Animated.View className={className} style={pulseStyle} />;
}

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const appearance = APPEARANCES[status];
  const dotClassName = `h-1.5 w-1.5 rounded-full ${appearance.dot}`;

  return (
    <View
      className={`flex-row items-center self-start rounded-full px-2.5 py-1 ${appearance.container}`}
    >
      {status === "inProgress" ? (
        <PulsingDot className={dotClassName} />
      ) : (
        <View className={dotClassName} />
      )}
      <Text className={`ml-1.5 font-roboto-medium text-xs ${appearance.text}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
