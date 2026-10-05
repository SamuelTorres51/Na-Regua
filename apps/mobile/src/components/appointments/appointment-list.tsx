import { ActivityIndicator, View } from "react-native";
import { EmptyState, type EmptyStateProps } from "@/components/ui/empty-state";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/models";
import { AppointmentCard } from "./appointment-card";

const LOAD_ERROR_STATE: EmptyStateProps = {
  description: "Puxe a tela para baixo para tentar de novo.",
  icon: "cloud-offline-outline",
  title: "Não foi possível carregar",
};

interface AppointmentListProps {
  appointments: Appointment[];
  emptyState: EmptyStateProps;
  hasLoadError: boolean;
  isLoading: boolean;
  onRequestCancel: (appointment: Appointment) => void;
}

export function AppointmentList({
  appointments,
  emptyState,
  hasLoadError,
  isLoading,
  onRequestCancel,
}: AppointmentListProps) {
  if (isLoading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (hasLoadError) {
    return <EmptyState {...LOAD_ERROR_STATE} />;
  }

  if (appointments.length === 0) {
    return <EmptyState {...emptyState} />;
  }

  return (
    <View className="gap-3">
      {appointments.map((appointment) => (
        <AppointmentCard
          appointment={appointment}
          key={appointment.id}
          onRequestCancel={onRequestCancel}
        />
      ))}
    </View>
  );
}
