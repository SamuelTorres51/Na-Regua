import { Text, View } from "react-native";

interface TagListProps {
  labels: readonly string[];
}

export function TagList({ labels }: TagListProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {labels.map((label) => (
        <View className="rounded-full bg-zinc-800 px-3 py-1" key={label}>
          <Text className="font-roboto-medium text-xs text-zinc-300">
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}
