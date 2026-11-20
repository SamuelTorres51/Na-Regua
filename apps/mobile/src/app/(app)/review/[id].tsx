import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { FormAlert } from "@/components/feedback/form-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import { FormScreen } from "@/components/layout/form-screen";
import { ReviewForm } from "@/components/reviews/review-form";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { useAppointment } from "@/features/appointments/use-appointment";
import { useMyReviews } from "@/features/reviews/use-my-reviews";
import { useReviewForm } from "@/features/reviews/use-review-form";

const CONTENT_DELAY = 260;
const CONTENT_DURATION = 600;
const ACTIONS_DELAY = 420;
const ACTIONS_DURATION = 700;

export default function ReviewAppointment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointmentState = useAppointment(id);
  const reviewsState = useMyReviews();
  const {
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
  } = useReviewForm(id);

  const { appointment } = appointmentState;
  const isLoading = appointmentState.isLoading || reviewsState.isLoading;
  const hasLoadError =
    appointmentState.hasLoadError || reviewsState.hasLoadError;
  const isReviewable =
    hasSubmitted ||
    (appointment?.status === "completed" &&
      reviewsState.ratingsByAppointment[id] === undefined);

  function renderContent() {
    if (isLoading) {
      return <LoadingState />;
    }

    if (hasLoadError) {
      return <StateMessage {...LOAD_ERROR_MESSAGE} />;
    }

    if (!(appointment && isReviewable)) {
      return (
        <StateMessage
          description="Só é possível avaliar uma vez cada atendimento concluído."
          icon="star-outline"
          title="Avaliação indisponível"
        />
      );
    }

    return (
      <ReviewForm
        appointment={appointment}
        comment={comment}
        onChangeComment={setComment}
        onChangeRating={setRating}
        rating={rating}
      />
    );
  }

  return (
    <>
      <FormScreen>
        <View className="px-6">
          <BackButton />

          <ScreenHeader
            subtitle="Sua opinião ajuda a barbearia a melhorar."
            title={"Avaliar\natendimento"}
          />

          <Animated.View
            className="mt-8"
            entering={FadeInDown.delay(CONTENT_DELAY).duration(
              CONTENT_DURATION
            )}
          >
            {renderContent()}
          </Animated.View>
        </View>

        {isReviewable && !isLoading ? (
          <Animated.View
            className="mt-10 px-6"
            entering={FadeInUp.delay(ACTIONS_DELAY).duration(ACTIONS_DURATION)}
          >
            <FormAlert message={submitError} />

            <PrimaryButton
              accessibilityLabel="Enviar avaliação"
              isDisabled={rating === 0}
              isLoading={isSubmitting}
              label="Enviar avaliação"
              onPress={handleSubmit}
            />
          </Animated.View>
        ) : null}
      </FormScreen>

      <ConfirmDialog
        cancelLabel="Continuar avaliando"
        confirmLabel="Descartar"
        description="Sua avaliação ainda não foi enviada."
        isDestructive
        isVisible={isDiscardDialogVisible}
        onCancel={handleCancelDiscard}
        onConfirm={handleConfirmDiscard}
        title="Descartar avaliação?"
      />
    </>
  );
}
