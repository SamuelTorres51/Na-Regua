import type { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScrollScreen } from "@/components/layout/scroll-screen";
import { BackButton } from "@/components/ui/back-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { StepDots } from "@/components/ui/step-dots";
import {
  BOOKING_STEP_LABELS,
  type BookingStep,
} from "@/features/booking/steps";

const CONTENT_DELAY = 260;
const CONTENT_DURATION = 600;

export interface FlowStepScreenProps extends PropsWithChildren {
  isRefreshing?: boolean;
  onRefresh?: () => void;
  step: BookingStep;
  steps: readonly BookingStep[];
  subtitle: string;
  summary: ReactNode;
  title: string;
}

export function FlowStepScreen({
  children,
  isRefreshing,
  onRefresh,
  step,
  steps,
  subtitle,
  summary,
  title,
}: FlowStepScreenProps) {
  const stepIndex = steps.indexOf(step);
  const stepPosition = `Passo ${stepIndex + 1} de ${steps.length}`;

  return (
    <ScrollScreen isRefreshing={isRefreshing} onRefresh={onRefresh}>
      <View className="px-6">
        <BackButton />

        <ScreenHeader subtitle={subtitle} title={title} />

        <View
          accessibilityLabel={`${stepPosition}: ${BOOKING_STEP_LABELS[step]}`}
          accessible
        >
          <StepDots activeIndex={stepIndex} steps={steps} />
        </View>

        {summary}

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
