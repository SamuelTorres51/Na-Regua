import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, type ListRenderItemInfo, View } from "react-native";
import Animated, {
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { GradientBackground } from "@/components/layout/gradient-background";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  SegmentedControl,
  type SegmentedOption,
} from "@/components/ui/segmented-control";
import { splitAppointments } from "@/features/appointments/appointment-filters";
import type { Appointment } from "@/features/appointments/types";
import { useAppointments } from "@/features/appointments/use-appointments";
import { colors } from "@/theme/colors";
import { formatAppointmentDate, formatAppointmentTime } from "@/utils/datetime";

type AppointmentsTab = "history" | "upcoming";

const TABS: readonly SegmentedOption<AppointmentsTab>[] = [
  { label: "Próximos", value: "upcoming" },
  { label: "Histórico", value: "history" },
];

const EMPTY_STATES = {
  history: {
    description:
      "Atendimentos concluídos, cancelados e perdidos aparecem aqui.",
    icon: "clock",
    title: "Nenhum atendimento ainda",
  },
  upcoming: {
    description: "Quando você agendar um horário, ele aparece aqui.",
    icon: "calendar",
    title: "Nenhum horário marcado",
  },
} as const;

const BOTTOM_SPACING = 24;
const HORIZONTAL_SPACING = 24;
const TOP_SPACING = 16;
const TABS_DELAY = 260;
const TABS_DURATION = 600;

interface CancelDialogState {
  appointment: Appointment;
  isVisible: boolean;
}

function keyExtractor(appointment: Appointment) {
  return appointment.id;
}

function ItemSeparator() {
  return <View className="h-3" />;
}

function describeCancellation(appointment: Appointment) {
  const date = formatAppointmentDate(appointment.scheduledAt).toLowerCase();
  const time = formatAppointmentTime(appointment.scheduledAt);

  return `${appointment.serviceName} com ${appointment.barberName}, ${date} às ${time}. O horário será liberado para outros clientes.`;
}

export default function Appointments() {
  const insets = useSafeAreaInsets();
  const { appointments, cancelAppointment, cancellingId, isLoading } =
    useAppointments();

  const [tab, setTab] = useState<AppointmentsTab>("upcoming");
  const [cancelDialog, setCancelDialog] = useState<CancelDialogState | null>(
    null
  );

  const { history, upcoming } = useMemo(
    () => splitAppointments(appointments),
    [appointments]
  );
  const visibleAppointments = tab === "upcoming" ? upcoming : history;
  const emptyState = EMPTY_STATES[tab];

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

    await cancelAppointment(cancelDialog.appointment.id);
    handleCloseDialog();
  }, [cancelAppointment, cancelDialog, handleCloseDialog]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Appointment>) => (
      <AppointmentCard
        appointment={item}
        onRequestCancel={handleRequestCancel}
      />
    ),
    [handleRequestCancel]
  );

  return (
    <GradientBackground>
      <Animated.FlatList
        contentContainerStyle={{
          paddingBottom: insets.bottom + BOTTOM_SPACING,
          paddingHorizontal: HORIZONTAL_SPACING,
          paddingTop: insets.top + TOP_SPACING,
        }}
        data={visibleAppointments}
        ItemSeparatorComponent={ItemSeparator}
        itemLayoutAnimation={LinearTransition}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <EmptyState
              description={emptyState.description}
              icon={emptyState.icon}
              title={emptyState.title}
            />
          )
        }
        ListHeaderComponent={
          <View className="pb-6">
            <BackButton />
            <ScreenHeader
              subtitle="Acompanhe e gerencie seus horários."
              title={"Meus\nagendamentos"}
            />
            <Animated.View
              className="mt-8"
              entering={FadeInDown.delay(TABS_DELAY).duration(TABS_DURATION)}
            >
              <SegmentedControl onChange={setTab} options={TABS} value={tab} />
            </Animated.View>
          </View>
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

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
    </GradientBackground>
  );
}
