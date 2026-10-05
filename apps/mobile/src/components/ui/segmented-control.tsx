import { useCallback, useEffect, useState } from "react";
import { type LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const BORDER_WIDTH = 1;
const TRACK_PADDING = 4;
const SLIDE_CONFIG = { duration: 260, easing: Easing.out(Easing.cubic) };

export interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentProps<T extends string> {
  isActive: boolean;
  label: string;
  onSelect: (value: T) => void;
  value: T;
}

function Segment<T extends string>({
  isActive,
  label,
  onSelect,
  value,
}: SegmentProps<T>) {
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      className="h-11 flex-1 items-center justify-center"
      onPress={handlePress}
    >
      <Text
        className={
          isActive
            ? "font-roboto-semibold text-sm text-white"
            : "font-roboto-medium text-sm text-zinc-500"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface SegmentedControlProps<T extends string> {
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  value: T;
}

export function SegmentedControl<T extends string>({
  onChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const segmentWidth = trackWidth / options.length;

  useEffect(() => {
    translateX.value = withTiming(activeIndex * segmentWidth, SLIDE_CONFIG);
  }, [activeIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(
      event.nativeEvent.layout.width - (BORDER_WIDTH + TRACK_PADDING) * 2
    );
  }, []);

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-2xl border border-zinc-800 bg-zinc-900/60 p-1"
      onLayout={handleLayout}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          className="absolute top-1 bottom-1 left-1 rounded-xl bg-zinc-800"
          style={[{ width: segmentWidth }, indicatorStyle]}
        />
      ) : null}

      {options.map((option) => (
        <Segment
          isActive={option.value === value}
          key={option.value}
          label={option.label}
          onSelect={onChange}
          value={option.value}
        />
      ))}
    </View>
  );
}
