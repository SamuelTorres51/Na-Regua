import type { PropsWithChildren } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { metrics } from "@/theme/metrics";
import { GradientBackground } from "./gradient-background";

const CONTENT_BOTTOM_SPACING = 24;
const TOP_SPACING = 16;

interface TabScreenProps extends PropsWithChildren {
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function TabScreen({
  children,
  isRefreshing = false,
  onRefresh,
}: TabScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom:
            insets.bottom +
            metrics.tabBar.bottomOffset +
            metrics.tabBar.height +
            CONTENT_BOTTOM_SPACING,
          paddingTop: insets.top + TOP_SPACING,
        }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              colors={[colors.accent]}
              onRefresh={onRefresh}
              progressBackgroundColor={colors.surface.card}
              progressViewOffset={insets.top}
              refreshing={isRefreshing}
              tintColor={colors.accent}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </GradientBackground>
  );
}
