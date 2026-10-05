import { type ReactNode, useCallback, useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/theme/colors";

const FOCUS_DURATION = 220;
const FOCUSED_SCALE = 1.12;
const ICON_SIZE = 22;
const SCALE_RANGE = FOCUSED_SCALE - 1;

interface TabIconProps {
  color: string;
  focused: boolean;
  size: number;
}

interface TabBarItemProps {
  isFocused: boolean;
  label: string;
  onPress: (routeKey: string, routeName: string, isFocused: boolean) => void;
  renderIcon?: (props: TabIconProps) => ReactNode;
  routeKey: string;
  routeName: string;
}

export function TabBarItem({
  isFocused,
  label,
  onPress,
  renderIcon,
  routeKey,
  routeName,
}: TabBarItemProps) {
  const progress = useSharedValue(Number(isFocused));

  useEffect(() => {
    progress.value = withTiming(Number(isFocused), {
      duration: FOCUS_DURATION,
    });
  }, [isFocused, progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * SCALE_RANGE }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [colors.icon.muted, colors.icon.active]
    ),
  }));

  const handlePress = useCallback(
    () => onPress(routeKey, routeName, isFocused),
    [isFocused, onPress, routeKey, routeName]
  );

  const iconColor = isFocused ? colors.icon.active : colors.icon.muted;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      className="flex-1 items-center justify-center"
      onPress={handlePress}
    >
      <Animated.View style={iconStyle}>
        {renderIcon?.({
          color: iconColor,
          focused: isFocused,
          size: ICON_SIZE,
        })}
      </Animated.View>

      <Animated.Text
        className="mt-1 font-roboto-medium text-[11px]"
        style={labelStyle}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}
