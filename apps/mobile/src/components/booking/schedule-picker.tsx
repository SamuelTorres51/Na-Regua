import { useState } from "react";
import { Text, View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import type { BookingDay } from "@/types/models";
import { DateStrip } from "./date-strip";
import { TimeSlotGrid } from "./time-slot-grid";

interface SchedulePickerProps {
  days: BookingDay[];
  hasLoadError: boolean;
  isLoading: boolean;
  onSelectSlot: (startsAt: string) => void;
}

export function SchedulePicker({
  days,
  hasLoadError,
  isLoading,
  onSelectSlot,
}: SchedulePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>();

  if (isLoading) {
    return <LoadingState />;
  }

  if (hasLoadError) {
    return <StateMessage {...LOAD_ERROR_MESSAGE} />;
  }

  const selectedDay =
    days.find((day) => day.date === selectedDate) ??
    days.find((day) => day.status === "available") ??
    days.at(0);

  if (!selectedDay) {
    return (
      <StateMessage
        description="Volte e escolha outro serviço ou profissional."
        icon="calendar-outline"
        title="Agenda indisponível"
      />
    );
  }

  return (
    <View>
      <Text
        accessibilityRole="header"
        className="mb-3 font-roboto-medium text-sm text-zinc-400"
      >
        Data
      </Text>
      <DateStrip
        days={days}
        onSelect={setSelectedDate}
        selectedDate={selectedDay.date}
      />

      <Text
        accessibilityRole="header"
        className="mt-8 mb-3 font-roboto-medium text-sm text-zinc-400"
      >
        Horários livres
      </Text>
      <TimeSlotGrid day={selectedDay} onSelect={onSelectSlot} />
    </View>
  );
}
