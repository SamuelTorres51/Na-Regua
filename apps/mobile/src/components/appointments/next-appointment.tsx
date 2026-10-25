import { Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import { Icon } from "@/components/ui/icon";
import { classNames } from "@/theme/class-names";
import type { Appointment } from "@/types/models";
import { AppointmentSummary } from "./appointment-summary";

const FADE_DURATION = 280;

interface NextAppointmentProps {
  appointment: Appointment | undefined;
  hasLoadError: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export function NextAppointment({
  appointment,
  hasLoadError,
  isLoading,
  onPress,
}: NextAppointmentProps) {
  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  if (hasLoadError) {
    return <StateMessage {...LOAD_ERROR_MESSAGE} variant="card" />;
  }

  if (!appointment) {
    return (
      <StateMessage
        description="Toque em Agendar para marcar seu próximo corte."
        icon="calendar-clear-outline"
        title="Nenhum horário marcado"
        variant="card"
      />
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(FADE_DURATION)}>
      <Pressable
        accessibilityLabel={`Ver agendamento de ${appointment.service.name}`}
        accessibilityRole="button"
        className={`p-5 active:opacity-80 ${classNames.card}`}
        onPress={onPress}
      >
        <AppointmentSummary
          appointment={appointment}
          trailing={<Icon name="chevron-forward" size="sm" tone="muted" />}
        />
      </Pressable>
    </Animated.View>
  );
}
