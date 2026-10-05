import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { TabScreen } from "@/components/layout/tab-screen";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { EmptyStateProps } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/components/ui/segmented-control";
import { splitAppointments } from "@/features/appointments/status";
import { useAppointments } from "@/features/appointments/use-appointments";
import { useCancellationDialog } from "@/features/appointments/use-cancellation-dialog";
import type { Appointment } from "@/types/models";
import { formatRelativeDate, formatTime } from "@/utils/format";

type AppointmentsTab = "history" | "upcoming";

const TABS: readonly SegmentedOption<AppointmentsTab>[] = [
  { label: "Próximos", value: "upcoming" },
  { label: "Histórico", value: "history" },
];

const EMPTY_STATES: Record<AppointmentsTab, EmptyStateProps> = {
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
};

const TABS_DELAY = 260;
const TABS_DURATION = 600;

function describeCancellation({ barber, service, startsAt }: Appointment) {
  const date = formatRelativeDate(startsAt).toLowerCase();

  return `${service.name} com ${barber.name}, ${date} às ${formatTime(startsAt)}. O horário será liberado para outros clientes.`;
}

export default function Appointments() {
  const {
    appointments,
    cancelAppointment,
    hasLoadError,
    isCancelling,
    isLoading,
    isRefreshing,
    refresh,
  } = useAppointments();

  const {
    dialog,
    handleCloseDialog,
    handleConfirmCancel,
    handleRequestCancel,
  } = useCancellationDialog(cancelAppointment);

  const [tab, setTab] = useState<AppointmentsTab>("upcoming");

  const { history, upcoming } = useMemo(
    () => splitAppointments(appointments),
    [appointments]
  );

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

      {dialog ? (
        <ConfirmDialog
          cancelLabel="Voltar"
          confirmLabel="Sim, cancelar"
          description={describeCancellation(dialog.appointment)}
          isConfirming={isCancelling}
          isDestructive
          isVisible={dialog.isVisible}
          onCancel={handleCloseDialog}
          onConfirm={handleConfirmCancel}
          title="Cancelar agendamento?"
        />
      ) : null}
    </>
  );
}
