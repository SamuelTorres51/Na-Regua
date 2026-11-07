import type { PropsWithChildren } from "react";
import { type BookingStep, RESCHEDULE_STEPS } from "@/features/booking/steps";
import type { Appointment } from "@/types/models";
import { BookingSummary } from "./booking-summary";
import { FlowStepScreen } from "./flow-step-screen";

interface RescheduleStepScreenProps extends PropsWithChildren {
  appointment: Appointment | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  startsAt?: string;
  step: BookingStep;
  subtitle: string;
}

export function RescheduleStepScreen({
  appointment,
  children,
  isRefreshing,
  onRefresh,
  startsAt,
  step,
  subtitle,
}: RescheduleStepScreenProps) {
  return (
    <FlowStepScreen
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      step={step}
      steps={RESCHEDULE_STEPS}
      subtitle={subtitle}
      summary={
        <BookingSummary
          barber={appointment?.barber}
          previousStartsAt={appointment?.startsAt}
          service={appointment?.service}
          startsAt={startsAt}
        />
      }
      title={"Reagendar\nhorário"}
    >
      {children}
    </FlowStepScreen>
  );
}
