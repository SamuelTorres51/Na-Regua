import { Text, View } from "react-native";
import { Icon } from "./icon";

interface InfoNoteProps {
  message: string;
}

export function InfoNote({ message }: InfoNoteProps) {
  return (
    <View className="flex-row items-center rounded-2xl bg-zinc-800/50 px-4 py-3">
      <Icon name="information-circle-outline" size="sm" tone="muted" />
      <Text className="ml-2 flex-1 font-roboto text-sm text-zinc-400">
        {message}
      </Text>
    </View>
  );
}
