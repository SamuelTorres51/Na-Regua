import { Pressable } from "react-native";
import { Icon, type IconName } from "./icon";

interface IconButtonProps {
  accessibilityLabel: string;
  icon: IconName;
  onPress: () => void;
}

export function IconButton({
  accessibilityLabel,
  icon,
  onPress,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-11 w-11 items-center justify-center rounded-full border border-zinc-800 active:opacity-60"
      hitSlop={8}
      onPress={onPress}
    >
      <Icon name={icon} size="lg" />
    </Pressable>
  );
}
