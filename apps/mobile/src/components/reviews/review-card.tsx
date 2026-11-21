import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { StarRating } from "@/components/ui/star-rating";
import { classNames } from "@/theme/class-names";
import type { ReviewHistoryItem } from "@/types/models";
import { formatRelativeDate } from "@/utils/format";

const FADE_DURATION = 280;
const UNKNOWN_SERVICE_NAME = "Atendimento";

function describeAppointment({ appointment, review }: ReviewHistoryItem) {
  const date = formatRelativeDate(appointment?.startsAt ?? review.createdAt);

  return appointment ? `${appointment.barber.name} · ${date}` : date;
}

export function ReviewCard(item: ReviewHistoryItem) {
  const { appointment, review } = item;

  return (
    <Animated.View
      className={`p-5 ${classNames.card}`}
      entering={FadeIn.duration(FADE_DURATION)}
    >
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 font-roboto-semibold text-lg text-white">
          {appointment?.service.name ?? UNKNOWN_SERVICE_NAME}
        </Text>
        <View className="mt-1.5 ml-4">
          <StarRating value={review.rating} />
        </View>
      </View>

      <Text className="mt-1 font-roboto text-sm text-zinc-400">
        {describeAppointment(item)}
      </Text>

      {review.comment ? (
        <Text className="mt-4 font-roboto text-sm text-zinc-300 leading-5">
          “{review.comment}”
        </Text>
      ) : null}
    </Animated.View>
  );
}
