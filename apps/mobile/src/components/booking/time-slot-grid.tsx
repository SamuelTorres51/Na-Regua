import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  StateMessage,
  type StateMessageContent,
} from "@/components/feedback/state-message";
import {
  DAY_PERIOD_LABELS,
  groupSlotsByPeriod,
  type UnavailableDayStatus,
} from "@/features/booking/schedule";
import { BOOKING_SELECT_HINT } from "@/features/booking/steps";
import type { BookingDay } from "@/types/models";
import { formatLongDate, formatTime } from "@/utils/format";

const FADE_DURATION = 240;

const UNAVAILABLE_MESSAGES: Record<UnavailableDayStatus, StateMessageContent> =
  {
    closed: {
      description: "A barbearia não abre neste dia. Escolha outra data.",
      icon: "storefront-outline",
      title: "Barbearia fechada",
    },
    dayOff: {
      description:
        "O profissional não atende neste dia. Escolha outra data ou volte e troque de profissional.",
      icon: "cafe-outline",
      title: "Profissional de folga",
    },
    full: {
      description: "Não há mais horários livres neste dia. Escolha outra data.",
      icon: "time-outline",
      title: "Sem horários livres",
    },
  };

interface TimeSlotButtonProps {
  onSelect: (startsAt: string) => void;
  startsAt: string;
}

function TimeSlotButton({ onSelect, startsAt }: TimeSlotButtonProps) {
  const time = formatTime(startsAt);

  const handlePress = useCallback(
    () => onSelect(startsAt),
    [onSelect, startsAt]
  );

  return (
    <View className="w-1/4 p-1">
      <Pressable
        accessibilityHint={BOOKING_SELECT_HINT}
        accessibilityLabel={`${time}, ${formatLongDate(startsAt)}`}
        accessibilityRole="button"
        className="h-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 active:border-brand active:opacity-80"
        onPress={handlePress}
      >
        <Text className="font-roboto-semibold text-base text-white">
          {time}
        </Text>
      </Pressable>
    </View>
  );
}

interface TimeSlotGridProps {
  day: BookingDay;
  onSelect: (startsAt: string) => void;
}

export function TimeSlotGrid({ day, onSelect }: TimeSlotGridProps) {
  if (day.status !== "available") {
    return (
      <StateMessage
        {...UNAVAILABLE_MESSAGES[day.status]}
        key={day.date}
        variant="card"
      />
    );
  }

  return (
    <Animated.View
      className="gap-6"
      entering={FadeIn.duration(FADE_DURATION)}
      key={day.date}
    >
      {groupSlotsByPeriod(day.slots).map((group) => (
        <View key={group.period}>
          <Text className="mb-2 font-roboto-medium text-xs text-zinc-500 uppercase">
            {DAY_PERIOD_LABELS[group.period]}
          </Text>
          <View className="-m-1 flex-row flex-wrap">
            {group.slots.map((slot) => (
              <TimeSlotButton key={slot} onSelect={onSelect} startsAt={slot} />
            ))}
          </View>
        </View>
      ))}
    </Animated.View>
  );
}
