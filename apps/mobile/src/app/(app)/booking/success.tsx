import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { BookingSummary } from "@/components/booking/booking-summary";
import { ScrollScreen } from "@/components/layout/scroll-screen";
import { Icon } from "@/components/ui/icon";
import { InfoNote } from "@/components/ui/info-note";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { CANCELLATION_POLICY_MESSAGE } from "@/features/appointments/cancellation";
import { useBookingSelection } from "@/features/booking/use-booking-selection";
import { layout } from "@/theme/styles";

const BADGE_DAMPING = 12;
const ACTIONS_DELAY = 320;
const ACTIONS_DURATION = 600;

export default function BookingSuccess() {
  const router = useRouter();
  const { barberId, serviceId, startsAt } = useLocalSearchParams<{
    barberId: string;
    serviceId: string;
    startsAt: string;
  }>();
  const selection = useBookingSelection({ barberId, serviceId });

  const handleGoToAppointments = useCallback(() => {
    router.dismissAll();
    router.navigate("/appointments");
  }, [router]);

  const handleGoHome = useCallback(() => {
    router.dismissAll();
    router.navigate("/");
  }, [router]);

  return (
    <ScrollScreen>
      <View className="px-6">
        <Animated.View
          accessibilityLabel="Agendamento confirmado"
          accessible
          className="h-16 w-16 items-center justify-center rounded-full border border-green-400/30 bg-green-400/10"
          entering={ZoomIn.springify().damping(BADGE_DAMPING)}
        >
          <Icon name="checkmark" size="xl" tone="success" />
        </Animated.View>

        <ScreenHeader
          subtitle="Seu horário está reservado. Te esperamos na barbearia!"
          title={"Horário\nagendado!"}
        />

        <BookingSummary
          barber={selection.barber}
          service={selection.service}
          startsAt={startsAt}
        />

        <Animated.View
          className="mt-8"
          entering={FadeInDown.delay(ACTIONS_DELAY).duration(ACTIONS_DURATION)}
          style={layout.actionGroup}
        >
          <InfoNote message={CANCELLATION_POLICY_MESSAGE} />

          <View className="mt-4" style={layout.actionGroup}>
            <PrimaryButton
              accessibilityLabel="Ver meus agendamentos"
              label="Ver meus agendamentos"
              onPress={handleGoToAppointments}
            />
            <SecondaryButton
              accessibilityLabel="Voltar ao início"
              label="Voltar ao início"
              onPress={handleGoHome}
            />
          </View>
        </Animated.View>
      </View>
    </ScrollScreen>
  );
}
