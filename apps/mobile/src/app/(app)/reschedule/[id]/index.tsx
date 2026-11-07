import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { RescheduleStepScreen } from "@/components/booking/reschedule-step-screen";
import { SchedulePicker } from "@/components/booking/schedule-picker";
import type { StateMessageContent } from "@/components/feedback/state-message";
import { useAppointment } from "@/features/appointments/use-appointment";
import { useRescheduleDays } from "@/features/booking/use-booking-days";

const RESCHEDULE_UNAVAILABLE_MESSAGE: StateMessageContent = {
  description:
    "Este agendamento não pode mais ser reagendado. Confira em Agendamentos.",
  icon: "calendar-outline",
  title: "Reagendamento indisponível",
};

export default function RescheduleScheduleStep() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointment = useAppointment(id);
  const { days, hasLoadError, isLoading, isRefreshing, refresh } =
    useRescheduleDays(id);

  const handleSelectSlot = useCallback(
    (startsAt: string) =>
      router.push({
        params: { id, startsAt },
        pathname: "/reschedule/[id]/confirmation",
      }),
    [id, router]
  );

  return (
    <RescheduleStepScreen
      appointment={appointment}
      isRefreshing={isRefreshing}
      onRefresh={refresh}
      step="schedule"
      subtitle="Escolha a nova data e o novo horário."
    >
      <SchedulePicker
        days={days}
        emptyMessage={RESCHEDULE_UNAVAILABLE_MESSAGE}
        hasLoadError={hasLoadError}
        isLoading={isLoading}
        onSelectSlot={handleSelectSlot}
      />
    </RescheduleStepScreen>
  );
}
