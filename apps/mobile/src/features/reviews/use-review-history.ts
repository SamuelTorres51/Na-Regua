import { useQueryData } from "@/hooks/use-query-data";
import { listMyReviewHistory } from "@/services/reviews";
import type { ReviewHistoryItem } from "@/types/models";
import { MY_REVIEWS_QUERY_KEY } from "./use-my-reviews";

const NO_HISTORY: ReviewHistoryItem[] = [];

export function useReviewHistory() {
  const {
    data: items,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useQueryData(
    [...MY_REVIEWS_QUERY_KEY, "history"],
    listMyReviewHistory,
    NO_HISTORY
  );

  return { hasLoadError, isLoading, isRefreshing, items, refresh };
}
