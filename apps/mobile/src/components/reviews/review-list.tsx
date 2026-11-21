import { View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import type { ReviewHistoryItem } from "@/types/models";
import { ReviewCard } from "./review-card";

interface ReviewListProps {
  hasLoadError: boolean;
  isLoading: boolean;
  items: ReviewHistoryItem[];
}

export function ReviewList({
  hasLoadError,
  isLoading,
  items,
}: ReviewListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (hasLoadError) {
    return <StateMessage {...LOAD_ERROR_MESSAGE} />;
  }

  if (items.length === 0) {
    return (
      <StateMessage
        description="Depois de um atendimento concluído, avalie em Agendamentos, na aba Histórico."
        icon="star-outline"
        title="Nenhuma avaliação ainda"
      />
    );
  }

  return (
    <View className="gap-3">
      {items.map((item) => (
        <ReviewCard {...item} key={item.review.id} />
      ))}
    </View>
  );
}
