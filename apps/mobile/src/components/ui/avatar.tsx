import { Text, View } from "react-native";
import { getInitials } from "@/utils/format";

interface AvatarProps {
  name: string;
}

export function Avatar({ name }: AvatarProps) {
  return (
    <View
      accessibilityElementsHidden
      className="h-16 w-16 items-center justify-center rounded-full border border-brand/30 bg-brand/15"
      importantForAccessibility="no-hide-descendants"
    >
      <Text className="font-roboto-bold text-brand text-xl">
        {getInitials(name)}
      </Text>
    </View>
  );
}
