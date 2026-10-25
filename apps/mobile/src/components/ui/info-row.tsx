import { Text, View } from "react-native";
import { Icon, type IconName } from "./icon";

interface InfoRowProps {
  icon: IconName;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      accessible
      className="flex-row items-center"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80">
        <Icon name={icon} size="sm" tone="subtle" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="font-roboto text-xs text-zinc-500">{label}</Text>
        <Text className="mt-0.5 font-roboto-medium text-base text-zinc-100">
          {value}
        </Text>
      </View>
    </View>
  );
}
