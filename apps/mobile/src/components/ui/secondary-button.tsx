import { Pressable, Text } from "react-native";

interface SecondaryButtonProps {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
}

export function SecondaryButton({
  accessibilityLabel,
  label,
  onPress,
}: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="h-14 items-center justify-center rounded-2xl border border-zinc-700 active:opacity-70"
      onPress={onPress}
    >
      <Text className="font-roboto-medium text-base text-white">{label}</Text>
    </Pressable>
  );
}
