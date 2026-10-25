import Ionicons from "@expo/vector-icons/Ionicons";
import { selectionAsync } from "expo-haptics";
import { type ComponentProps, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/theme/colors";

const ICON_SIZE = 20;

export interface TabBarActionProps {
  accessibilityLabel: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}

export function TabBarAction({
  accessibilityLabel,
  icon,
  label,
  onPress,
}: TabBarActionProps) {
  const handlePress = useCallback(() => {
    selectionAsync();
    onPress();
  }, [onPress]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="flex-1 items-center justify-center active:opacity-80"
      onPress={handlePress}
    >
      <View className="h-8 w-12 items-center justify-center rounded-xl bg-brand">
        <Ionicons color={colors.accentContrast} name={icon} size={ICON_SIZE} />
      </View>
      <Text className="mt-1 font-roboto-medium text-[11px] text-brand">
        {label}
      </Text>
    </Pressable>
  );
}
