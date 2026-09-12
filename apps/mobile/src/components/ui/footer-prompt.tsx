import { Text, View } from "react-native";
import { TextLink } from "./text-link";

interface FooterPromptProps {
  accessibilityLabel: string;
  actionLabel: string;
  message: string;
  onPress: () => void;
}

export function FooterPrompt({
  accessibilityLabel,
  actionLabel,
  message,
  onPress,
}: FooterPromptProps) {
  return (
    <View className="mt-8 flex-row justify-center">
      <Text className="font-roboto text-sm text-zinc-500">{message} </Text>
      <TextLink
        accessibilityLabel={accessibilityLabel}
        label={actionLabel}
        onPress={onPress}
      />
    </View>
  );
}
