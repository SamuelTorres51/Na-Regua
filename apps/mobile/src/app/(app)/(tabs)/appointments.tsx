import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { TabScreen } from "@/components/layout/tab-screen";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/components/ui/segmented-control";
import { splitAppointments } from "@/features/appointments/status";
import { useAppointments } from "@/features/appointments/use-appointments";
import { colors } from "@/theme/colors";
import type { Appointment } from "@/types/models";
import { formatRelativeDate, formatTime } from "@/utils/format";

type AppointmentsTab = "history" | "upcoming";

const TABS: readonly SegmentedOption<AppointmentsTab>[] = [
  { label: "Próximos", value: "upcoming" },
  { label: "Histórico", value: "history" },
];

const EMPTY_STATES = {
  history: {
    description:
      "Atendimentos concluídos, cancelados e perdidos aparecem aqui.",
    icon: "time-outline",
    title: "Nenhum atendimento ainda",
  },
  upcoming: {
    description: "Quando você agendar um horário, ele aparece aqui.",
    icon: "calendar-outline",
    title: "Nenhum horário marcado",
  },
} as const;

const TABS_DELAY = 260;
const TABS_DURATION = 600;

interface CancelDialogState {
  appointment: Appointment;
  isVisible: boolean;
}

function describeCancellation({ barber, service, startsAt }: Appointment) {
  const date = formatRelativeDate(startsAt).toLowerCase();

  return `${service.name} com ${barber.name}, ${date} às ${formatTime(startsAt)}. O horário será liberado para outros clientes.`;
}

interface AppointmentListProps {
  appointments: Appointment[];
  emptyState: (typeof EMPTY_STATES)[AppointmentsTab];
  hasLoadError: boolean;
  isLoading: boolean;
  onRequestCancel: (appointment: Appointment) => void;
}

function AppointmentList({
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
    return (
      <EmptyState
        description="Puxe a tela para baixo para tentar de novo."
        icon="cloud-offline-outline"
        title="Não foi possível carregar"
      />
    );
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        description={emptyState.description}
        icon={emptyState.icon}
        title={emptyState.title}
      />
    );
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

export default function Appointments() {
  const {
    appointments,
    cancelAppointment,
    cancellingId,
    hasLoadError,
    isLoading,
    isRefreshing,
    refresh,
  } = useAppointments();

  const [tab, setTab] = useState<AppointmentsTab>("upcoming");
  const [cancelDialog, setCancelDialog] = useState<CancelDialogState | null>(
    null
  );

  const { history, upcoming } = useMemo(
    () => splitAppointments(appointments),
    [appointments]
  );

  const handleRequestCancel = useCallback((appointment: Appointment) => {
    setCancelDialog({ appointment, isVisible: true });
  }, []);

  // Mantém o agendamento no estado ao fechar, para o texto do diálogo não
  // sumir durante a animação de saída do modal.
  const handleCloseDialog = useCallback(() => {
    setCancelDialog((current) =>
      current ? { ...current, isVisible: false } : null
    );
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelDialog) {
      return;
    }

    try {
      await cancelAppointment(cancelDialog.appointment.id);
    } finally {
      handleCloseDialog();
    }
  }, [cancelAppointment, cancelDialog, handleCloseDialog]);

  return (
    <>
      <TabScreen isRefreshing={isRefreshing} onRefresh={refresh}>
        <View className="px-6">
          <ScreenHeader
            subtitle="Seus horários marcados e o histórico."
            title="Agendamentos"
          />

          <Animated.View
            className="mt-8"
            entering={FadeInDown.delay(TABS_DELAY).duration(TABS_DURATION)}
          >
            <SegmentedControl onChange={setTab} options={TABS} value={tab} />
          </Animated.View>

          <View className="mt-6">
            <AppointmentList
              appointments={tab === "upcoming" ? upcoming : history}
              emptyState={EMPTY_STATES[tab]}
              hasLoadError={hasLoadError}
              isLoading={isLoading}
              onRequestCancel={handleRequestCancel}
            />
          </View>
        </View>
      </TabScreen>

      {cancelDialog ? (
        <ConfirmDialog
          cancelLabel="Voltar"
          confirmLabel="Sim, cancelar"
          description={describeCancellation(cancelDialog.appointment)}
          isConfirming={cancellingId !== null}
          isDestructive
          isVisible={cancelDialog.isVisible}
          onCancel={handleCloseDialog}
          onConfirm={handleConfirmCancel}
          title="Cancelar agendamento?"
        />
      ) : null}
    </>
  );
}
