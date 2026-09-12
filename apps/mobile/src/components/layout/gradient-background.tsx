import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { colors } from "@/theme/colors";
import { layout } from "@/theme/styles";

export function GradientBackground({ children }: PropsWithChildren) {
  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient colors={colors.gradient} style={layout.fill}>
        {children}
      </LinearGradient>
    </View>
  );
}
