import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { PersonSummary } from "@/components/ui/person-summary";
import { classNames } from "@/theme/class-names";
import type { BookingSelection } from "@/types/models";
import { formatDuration, formatPrice } from "@/utils/format";

const FADE_DURATION = 280;

interface SummarySectionProps extends PropsWithChildren {
  label: string;
}

function SummarySection({ children, label }: SummarySectionProps) {
  return (
    <Animated.View className="mt-8" entering={FadeIn.duration(FADE_DURATION)}>
      <Text className="mb-3 font-roboto-medium text-sm text-zinc-400">
        {label}
      </Text>
      <View className={`p-5 ${classNames.card}`}>{children}</View>
    </Animated.View>
  );
}

export function BookingSummary({ barber, service }: BookingSelection) {
  return (
    <>
      {service ? (
        <SummarySection label="Serviço escolhido">
          <Text className="font-roboto-semibold text-lg text-white">
            {service.name}
          </Text>
          <Text className="mt-1 font-roboto text-sm text-zinc-400">
            {`${formatDuration(service.durationMinutes)} · ${formatPrice(service.priceInCents)}`}
          </Text>
        </SummarySection>
      ) : null}

      {barber ? (
        <SummarySection label="Profissional escolhido">
          <PersonSummary description={barber.role} name={barber.name} />
        </SummarySection>
      ) : null}
    </>
  );
}
