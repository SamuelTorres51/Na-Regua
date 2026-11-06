import { useCallback } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import {
  DAY_STATUS_LABELS,
  describeFreeSlots,
} from "@/features/booking/schedule";
import type { BookingDay } from "@/types/models";
import {
  formatDayOfMonth,
  formatLongDate,
  formatMonth,
  formatWeekday,
} from "@/utils/format";

const CHIP_STYLES = {
  available: {
    container: "border-zinc-800 bg-zinc-900/60",
    day: "text-white",
    label: "text-zinc-400",
  },
  selected: {
    container: "border-brand bg-brand",
    day: "text-zinc-950",
    label: "text-zinc-900",
  },
  unavailable: {
    container: "border-zinc-900",
    day: "text-zinc-600",
    label: "text-zinc-600",
  },
  unavailableSelected: {
    container: "border-zinc-600 bg-zinc-800/60",
    day: "text-zinc-300",
    label: "text-zinc-400",
  },
} as const;

function getChipStyles(isAvailable: boolean, isSelected: boolean) {
  if (isAvailable) {
    return isSelected ? CHIP_STYLES.selected : CHIP_STYLES.available;
  }

  return isSelected ? CHIP_STYLES.unavailableSelected : CHIP_STYLES.unavailable;
}

interface DateChipProps {
  day: BookingDay;
  isSelected: boolean;
  onSelect: (date: string) => void;
}

function DateChip({ day, isSelected, onSelect }: DateChipProps) {
  const statusLabel =
    day.status === "available" ? undefined : DAY_STATUS_LABELS[day.status];
  const isAvailable = statusLabel === undefined;
  const styles = getChipStyles(isAvailable, isSelected);
  const availability = statusLabel ?? describeFreeSlots(day.slots.length);

  const handlePress = useCallback(
    () => onSelect(day.date),
    [day.date, onSelect]
  );

  return (
    <Pressable
      accessibilityHint="Mostra os horários deste dia"
      accessibilityLabel={`${formatLongDate(day.date)}, ${availability}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={`h-20 w-[4.5rem] items-center justify-center rounded-2xl border active:opacity-80 ${styles.container}`}
      onPress={handlePress}
    >
      <Text className={`font-roboto-medium text-xs uppercase ${styles.label}`}>
        {formatWeekday(day.date)}
      </Text>
      <Text className={`mt-0.5 font-roboto-semibold text-xl ${styles.day}`}>
        {formatDayOfMonth(day.date)}
      </Text>
      <Text className={`font-roboto text-xs ${styles.label}`}>
        {statusLabel ?? formatMonth(day.date)}
      </Text>
    </Pressable>
  );
}

interface DateStripProps {
  days: BookingDay[];
  onSelect: (date: string) => void;
  selectedDate: string;
}

export function DateStrip({ days, onSelect, selectedDate }: DateStripProps) {
  return (
    <ScrollView
      className="-mx-6"
      contentContainerClassName="gap-2 px-6"
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {days.map((day) => (
        <DateChip
          day={day}
          isSelected={day.date === selectedDate}
          key={day.date}
          onSelect={onSelect}
        />
      ))}
    </ScrollView>
  );
}
