import { selectionAsync } from "expo-haptics";
import type { Tabs } from "expo-router";
import { type ComponentProps, useCallback, useEffect, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { metrics } from "@/theme/metrics";
import { TabBarItem } from "./tab-bar-item";

export type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const SPRING_CONFIG = { damping: 20, stiffness: 220 };
const { bottomOffset, height, padding } = metrics.tabBar;

export function TabBar({ descriptors, navigation, state }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useSharedValue(0);

  const tabWidth = (barWidth - padding * 2) / state.routes.length;

  useEffect(() => {
    indicatorX.value = withSpring(state.index * tabWidth, SPRING_CONFIG);
  }, [indicatorX, state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => setBarWidth(event.nativeEvent.layout.width),
    []
  );

  const handlePress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        canPreventDefault: true,
        target: routeKey,
        type: "tabPress",
      });

      if (isFocused || event.defaultPrevented) {
        return;
      }

      selectionAsync();
      navigation.navigate(routeName);
    },
    [navigation]
  );

  return (
    <View
      className="absolute right-6 left-6 flex-row rounded-3xl border border-zinc-800 bg-zinc-900/95"
      onLayout={handleLayout}
      style={{ bottom: insets.bottom + bottomOffset, height, padding }}
    >
      {barWidth > 0 ? (
        <Animated.View
          className="absolute rounded-2xl bg-brand/15"
          style={[
            { bottom: padding, left: padding, top: padding, width: tabWidth },
            indicatorStyle,
          ]}
        />
      ) : null}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        return (
          <TabBarItem
            isFocused={state.index === index}
            key={route.key}
            label={options.title ?? route.name}
            onPress={handlePress}
            renderIcon={options.tabBarIcon}
            routeKey={route.key}
            routeName={route.name}
          />
        );
      })}
    </View>
  );
}
