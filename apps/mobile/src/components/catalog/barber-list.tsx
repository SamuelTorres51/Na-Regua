import { View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import type { Barber } from "@/types/models";
import { BarberCard } from "./barber-card";

interface BarberListProps {
  barbers: Barber[];
  hasLoadError: boolean;
  isLoading: boolean;
  onSelect: (barber: Barber) => void;
}

export function BarberList({
  barbers,
  hasLoadError,
  isLoading,
  onSelect,
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
        description="A barbearia ainda não cadastrou sua equipe."
        icon="people-outline"
        title="Nenhum profissional disponível"
      />
    );
  }

  return (
    <View className="gap-3">
      {barbers.map((barber) => (
        <BarberCard barber={barber} key={barber.id} onSelect={onSelect} />
      ))}
    </View>
  );
}
