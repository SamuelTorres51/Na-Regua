import { Pressable, Text } from "react-native";

interface TextLinkProps {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
}

export function TextLink({
  accessibilityLabel,
  label,
  onPress,
}: TextLinkProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
    >
      <Text className="font-roboto-semibold text-brand text-sm">{label}</Text>
    </Pressable>
  );
}
