import { useMemo } from "react";
import { useQueryData } from "@/hooks/use-query-data";
import { listMyReviews } from "@/services/reviews";
import type { Review } from "@/types/models";

export const MY_REVIEWS_QUERY_KEY = ["my-reviews"] as const;

const NO_REVIEWS: Review[] = [];

export function useMyReviews() {
  const {
    data: reviews,
    hasLoadError,
    isLoading,
    refresh,
  } = useQueryData(MY_REVIEWS_QUERY_KEY, listMyReviews, NO_REVIEWS);

  const ratingsByAppointment = useMemo(
    () =>
      Object.fromEntries(
        reviews.map((review) => [review.appointmentId, review.rating])
      ) as Record<string, number>,
    [reviews]
  );

  return { hasLoadError, isLoading, ratingsByAppointment, refresh, reviews };
}
