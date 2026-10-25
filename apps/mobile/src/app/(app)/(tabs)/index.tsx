import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { NextAppointment } from "@/components/appointments/next-appointment";
import { TabScreen } from "@/components/layout/tab-screen";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { getNextAppointment } from "@/features/appointments/status";
import { useAppointments } from "@/features/appointments/use-appointments";
import { useSession } from "@/features/auth/session-provider";
import { layout } from "@/theme/styles";
import { getFirstName, getGreeting } from "@/utils/format";

const SECTION_DELAY = 260;
const ACTIONS_DELAY = 380;
const ENTERING_DURATION = 600;

export default function Home() {
  const router = useRouter();
  const { session } = useSession();
  const { appointments, hasLoadError, isLoading, isRefreshing, refresh } =
    useAppointments();

  const firstName = getFirstName(session?.user.fullName ?? "");
  const nextAppointment = useMemo(
    () => getNextAppointment(appointments),
    [appointments]
  );
  const sectionTitle =
    nextAppointment?.status === "inProgress"
      ? "Acontecendo agora"
      : "Seu próximo horário";

  const handleGoToBooking = useCallback(
    () => router.push("/booking"),
    [router]
  );

  const handleGoToAppointments = useCallback(
    () => router.navigate("/appointments"),
    [router]
  );

  return (
    <TabScreen isRefreshing={isRefreshing} onRefresh={refresh}>
      <View className="px-6">
        <ScreenHeader
          subtitle="Pronto para ficar na régua?"
          title={`${getGreeting()},\n${firstName}`}
        />

        <Animated.View
          className="mt-10"
          entering={FadeInDown.delay(SECTION_DELAY).duration(ENTERING_DURATION)}
        >
          <Text className="mb-3 font-roboto-medium text-sm text-zinc-400">
            {sectionTitle}
          </Text>
          <NextAppointment
            appointment={nextAppointment}
            hasLoadError={hasLoadError}
            isLoading={isLoading}
            onPress={handleGoToAppointments}
          />
        </Animated.View>

        <Animated.View
          className="mt-8"
          entering={FadeInDown.delay(ACTIONS_DELAY).duration(ENTERING_DURATION)}
          style={layout.actionGroup}
        >
          <PrimaryButton
            accessibilityLabel="Agendar um horário"
            label="Agendar horário"
            onPress={handleGoToBooking}
          />
          <SecondaryButton
            accessibilityLabel="Ver meus agendamentos"
            label="Ver meus agendamentos"
            onPress={handleGoToAppointments}
          />
        </Animated.View>
      </View>
    </TabScreen>
  );
}
