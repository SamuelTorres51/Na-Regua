import { Text, View } from "react-native";
import { AppointmentSummary } from "@/components/appointments/appointment-summary";
import { FormField } from "@/components/form/form-field";
import { StarRatingInput } from "@/components/ui/star-rating";
import { RATING_LABELS } from "@/features/reviews/ratings";
import { MAX_REVIEW_COMMENT_LENGTH } from "@/services/reviews";
import { classNames } from "@/theme/class-names";
import type { Appointment } from "@/types/models";
import { formatPrice } from "@/utils/format";

const SECTION_TITLE_CLASS_NAME =
  "mb-3 font-roboto-medium text-sm text-zinc-400";

interface ReviewFormProps {
  appointment: Appointment;
  comment: string;
  onChangeComment: (comment: string) => void;
  onChangeRating: (rating: number) => void;
  rating: number;
}

export function ReviewForm({
  appointment,
  comment,
  onChangeComment,
  onChangeRating,
  rating,
}: ReviewFormProps) {
  return (
    <View className="gap-8">
      <View className={`p-5 ${classNames.card}`}>
        <AppointmentSummary
          appointment={appointment}
          trailing={
            <Text className="font-roboto-semibold text-base text-white">
              {formatPrice(appointment.service.priceInCents)}
            </Text>
          }
        />
      </View>

      <View>
        <Text accessibilityRole="header" className={SECTION_TITLE_CLASS_NAME}>
          Sua nota
        </Text>
        <StarRatingInput onChange={onChangeRating} value={rating} />
        <Text className="mt-2 font-roboto text-sm text-zinc-500">
          {RATING_LABELS[rating] ?? "Toque nas estrelas para dar sua nota."}
        </Text>
      </View>

      <FormField
        autoCapitalize="none"
        autoComplete="off"
        delay={0}
        isMultiline
        label="Comentário (opcional)"
        maxLength={MAX_REVIEW_COMMENT_LENGTH}
        onChangeText={onChangeComment}
        placeholder="Conte como foi o atendimento"
        shakeTrigger={0}
        value={comment}
      />
    </View>
  );
}
