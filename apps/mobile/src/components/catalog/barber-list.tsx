import { Text, View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import type { Barber } from "@/types/models";
import { BarberCard } from "./barber-card";

interface BarberListProps {
  actionHint?: string;
  barbers: Barber[];
  emptyDescription?: string;
  hasLoadError: boolean;
  isLoading: boolean;
  onSelect: (barber: Barber) => void;
  title?: string;
}

export function BarberList({
  actionHint,
  barbers,
  emptyDescription = "A barbearia ainda não cadastrou sua equipe.",
  hasLoadError,
  isLoading,
  onSelect,
  title,
}: BarberListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (hasLoadError) {
    return <StateMessage {...LOAD_ERROR_MESSAGE} />;
  }

  if (barbers.length === 0) {
    return (
      <StateMessage
        description={emptyDescription}
        icon="people-outline"
        title="Nenhum profissional disponível"
      />
    );
  }

  return (
    <View>
      {title ? (
        <Text
          accessibilityRole="header"
          className="mb-3 font-roboto-medium text-sm text-zinc-400"
        >
          {title}
        </Text>
      ) : null}
      <View className="gap-3">
        {barbers.map((barber) => (
          <BarberCard
            actionHint={actionHint}
            barber={barber}
            key={barber.id}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
}
