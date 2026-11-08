import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Avatar } from "./avatar";

interface PersonSummaryProps {
  description?: string;
  name: string;
  trailing?: ReactNode;
}

export function PersonSummary({
  description,
  name,
  trailing,
}: PersonSummaryProps) {
  return (
    <View className="flex-row items-center">
      <Avatar name={name} />
      <View className="ml-4 flex-1">
        <Text className="font-roboto-semibold text-lg text-white">{name}</Text>
        {description ? (
          <Text className="mt-0.5 font-roboto text-sm text-zinc-500">
            {description}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
