import type { PropsWithChildren } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScrollScreen } from "@/components/layout/scroll-screen";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { StepDots } from "@/components/ui/step-dots";
import {
  BOOKING_STEP_LABELS,
  BOOKING_STEPS,
  type BookingStep,
} from "@/features/booking/steps";
import { useBookingSelection } from "@/features/booking/use-booking-selection";
import type { BookingSelectionIds } from "@/types/models";
import { BookingSummary } from "./booking-summary";

const CONTENT_DELAY = 260;
const CONTENT_DURATION = 600;

interface BookingStepScreenProps
  extends BookingSelectionIds,
    PropsWithChildren {
  isRefreshing?: boolean;
  onRefresh?: () => void;
  startsAt?: string;
  step: BookingStep;
  subtitle: string;
}

export function BookingStepScreen({
  barberId,
  children,
  isRefreshing,
  onRefresh,
  serviceId,
  startsAt,
  step,
  subtitle,
}: BookingStepScreenProps) {
  const selection = useBookingSelection({ barberId, serviceId });
  const stepIndex = BOOKING_STEPS.indexOf(step);
  const stepPosition = `Passo ${stepIndex + 1} de ${BOOKING_STEPS.length}`;

  return (
    <ScrollScreen isRefreshing={isRefreshing} onRefresh={onRefresh}>
      <View className="px-6">
        <BackButton />

        <ScreenHeader subtitle={subtitle} title={"Novo\nagendamento"} />

        <View
          accessibilityLabel={`${stepPosition}: ${BOOKING_STEP_LABELS[step]}`}
          accessible
        >
          <StepDots activeIndex={stepIndex} steps={BOOKING_STEPS} />
        </View>

        <BookingSummary
          barber={selection.barber}
          service={selection.service}
          startsAt={startsAt}
        />

        <Animated.View
          className="mt-8"
          entering={FadeInDown.delay(CONTENT_DELAY).duration(CONTENT_DURATION)}
        >
          {children}
        </Animated.View>
      </View>
    </ScrollScreen>
  );
}
