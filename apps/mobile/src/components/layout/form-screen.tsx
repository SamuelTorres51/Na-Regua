import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout } from "@/theme/styles";
import { GradientBackground } from "./gradient-background";

const BOTTOM_SPACING = 24;
const TOP_SPACING = 16;

export function FormScreen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={layout.fill}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingBottom: insets.bottom + BOTTOM_SPACING,
            paddingTop: insets.top + TOP_SPACING,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
