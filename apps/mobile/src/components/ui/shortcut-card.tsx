import { Pressable, Text, View } from "react-native";
import { classNames } from "@/theme/class-names";
import { Icon, type IconName } from "./icon";

interface ShortcutCardProps {
  description: string;
  icon: IconName;
  onPress: () => void;
  title: string;
}

export function ShortcutCard({
  description,
  icon,
  onPress,
  title,
}: ShortcutCardProps) {
  return (
    <Pressable
      accessibilityHint={description}
      accessibilityLabel={title}
      accessibilityRole="button"
      className={`flex-row items-center p-5 active:opacity-80 ${classNames.card}`}
      onPress={onPress}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-brand/15">
        <Icon name={icon} tone="accent" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="font-roboto-semibold text-base text-white">
          {title}
        </Text>
        <Text className="mt-0.5 font-roboto text-sm text-zinc-500">
          {description}
        </Text>
      </View>
      <Icon name="chevron-forward" size="sm" tone="muted" />
    </Pressable>
  );
}
