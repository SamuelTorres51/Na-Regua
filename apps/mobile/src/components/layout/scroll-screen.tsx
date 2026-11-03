import type { PropsWithChildren } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { GradientBackground } from "./gradient-background";

const BOTTOM_SPACING = 24;
const TOP_SPACING = 16;

export interface ScrollScreenProps extends PropsWithChildren {
  bottomInset?: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function ScrollScreen({
  bottomInset = 0,
  children,
  isRefreshing = false,
  onRefresh,
}: ScrollScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + bottomInset + BOTTOM_SPACING,
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
