import { View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
  type StateMessageContent,
} from "@/components/feedback/state-message";
import type { Appointment } from "@/types/models";
import { AppointmentCard } from "./appointment-card";

interface AppointmentListProps {
  appointments: Appointment[];
  emptyMessage: StateMessageContent;
  hasLoadError: boolean;
  isLoading: boolean;
  onRequestCancel: (appointment: Appointment) => void;
  onRequestReview: (appointment: Appointment) => void;
  ratingsByAppointment: Record<string, number>;
}

export function AppointmentList({
  appointments,
  emptyMessage,
  hasLoadError,
  isLoading,
  onRequestCancel,
  onRequestReview,
  ratingsByAppointment,
}: AppointmentListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (hasLoadError) {
    return <StateMessage {...LOAD_ERROR_MESSAGE} />;
  }

  if (appointments.length === 0) {
    return <StateMessage {...emptyMessage} />;
  }

  return (
    <View className="gap-3">
      {appointments.map((appointment) => (
        <AppointmentCard
          appointment={appointment}
          key={appointment.id}
          onRequestCancel={onRequestCancel}
          onRequestReview={onRequestReview}
          rating={ratingsByAppointment[appointment.id]}
        />
      ))}
    </View>
  );
}
