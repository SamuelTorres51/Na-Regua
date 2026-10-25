import { ActivityIndicator, View } from "react-native";
import { classNames } from "@/theme/class-names";
import { colors } from "@/theme/colors";

interface LoadingStateProps {
  variant?: "card" | "page";
}

export function LoadingState({ variant = "page" }: LoadingStateProps) {
  return (
    <View
      accessibilityLabel="Carregando"
      accessibilityRole="progressbar"
      className={
        variant === "card"
          ? `items-center py-10 ${classNames.card}`
          : "items-center py-16"
      }
    >
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
