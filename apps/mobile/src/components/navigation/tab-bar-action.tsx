import { selectionAsync } from "expo-haptics";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/icon";

export interface TabBarActionProps {
  accessibilityLabel: string;
  icon: IconName;
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
        <Icon name={icon} tone="onAccent" />
      </View>
      <Text className="mt-1 font-roboto-medium text-[11px] text-brand">
        {label}
      </Text>
    </Pressable>
  );
}
