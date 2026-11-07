import type { PropsWithChildren } from "react";
import { BOOKING_STEPS, type BookingStep } from "@/features/booking/steps";
import { useBookingSelection } from "@/features/booking/use-booking-selection";
import type { BookingSelectionIds } from "@/types/models";
import { BookingSummary } from "./booking-summary";
import { FlowStepScreen } from "./flow-step-screen";

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

  return (
    <FlowStepScreen
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      step={step}
      steps={BOOKING_STEPS}
      subtitle={subtitle}
      summary={
        <BookingSummary
          barber={selection.barber}
          service={selection.service}
          startsAt={startsAt}
        />
      }
      title={"Novo\nagendamento"}
    >
      {children}
    </FlowStepScreen>
  );
}
