import { useQueryClient } from "@tanstack/react-query";
import { NotificationFeedbackType, notificationAsync } from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import { useDiscardChangesGuard } from "@/hooks/use-discard-changes-guard";
import { isNetworkError } from "@/services/api-client";
import { createReview, ReviewUnavailableError } from "@/services/reviews";
import { MY_REVIEWS_QUERY_KEY } from "./use-my-reviews";

const REVIEW_SUCCESS_MESSAGE = "Avaliação enviada. Obrigado!";
const REVIEW_ERROR_MESSAGE =
  "Não foi possível enviar sua avaliação. Tente novamente.";
const REVIEW_UNAVAILABLE_MESSAGE =
  "Este atendimento não pode mais ser avaliado.";
const NETWORK_ERROR_MESSAGE =
  "Sem conexão com o servidor. Verifique sua internet e tente novamente.";

function describeReviewError(error: unknown) {
  if (error instanceof ReviewUnavailableError) {
    return REVIEW_UNAVAILABLE_MESSAGE;
  }

  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  return REVIEW_ERROR_MESSAGE;
}

export function useReviewForm(appointmentId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const hasChanges = rating > 0 || comment.trim().length > 0;

  const {
    allowLeave,
    handleCancelDiscard,
    handleConfirmDiscard,
    isDialogVisible: isDiscardDialogVisible,
  } = useDiscardChangesGuard({ hasChanges, isBusy: isSubmitting });

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createReview({ appointmentId, comment: comment.trim(), rating });
      setHasSubmitted(true);
      await queryClient.invalidateQueries({ queryKey: MY_REVIEWS_QUERY_KEY });
      allowLeave();
      notificationAsync(NotificationFeedbackType.Success);
      showToast({ message: REVIEW_SUCCESS_MESSAGE, tone: "success" });
      router.back();
    } catch (error) {
      setSubmitError(describeReviewError(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    allowLeave,
    appointmentId,
    comment,
    queryClient,
    rating,
    router,
    showToast,
  ]);

  return {
    comment,
    handleCancelDiscard,
    handleConfirmDiscard,
    handleSubmit,
    hasSubmitted,
    isDiscardDialogVisible,
    isSubmitting,
    rating,
    setComment,
    setRating,
    submitError,
  };
}
