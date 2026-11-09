import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { PersonSummary } from "@/components/ui/person-summary";
import { classNames } from "@/theme/class-names";
import type { BookingSelection, Service } from "@/types/models";
import { isValidDate } from "@/utils/date";
import {
  formatDuration,
  formatPrice,
  formatRelativeDate,
  formatTime,
} from "@/utils/format";

const FADE_DURATION = 280;
const MS_PER_MINUTE = 60_000;

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

function describeTimeRange(startsAt: string, service?: Service) {
  const startTime = formatTime(startsAt);

  if (!service) {
    return `Às ${startTime}`;
  }

  const endsAt = new Date(
    Date.parse(startsAt) + service.durationMinutes * MS_PER_MINUTE
  ).toISOString();

  return `Das ${startTime} às ${formatTime(endsAt)}`;
}

interface BookingSummaryProps extends BookingSelection {
  previousStartsAt?: string;
  startsAt?: string;
}

interface ScheduleDetailsProps {
  service?: Service;
  startsAt: string;
}

function ScheduleDetails({ service, startsAt }: ScheduleDetailsProps) {
  return (
    <>
      <Text className="font-roboto-semibold text-lg text-white">
        {formatRelativeDate(startsAt)}
      </Text>
      <Text className="mt-1 font-roboto text-sm text-zinc-400">
        {describeTimeRange(startsAt, service)}
      </Text>
    </>
  );
}

export function BookingSummary({
  barber,
  previousStartsAt,
  service,
  startsAt,
}: BookingSummaryProps) {
  const isRescheduling = isValidDate(previousStartsAt);

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
          <PersonSummary name={barber.name} />
        </SummarySection>
      ) : null}

      {isValidDate(previousStartsAt) ? (
        <SummarySection label="Horário atual">
          <ScheduleDetails service={service} startsAt={previousStartsAt} />
        </SummarySection>
      ) : null}

      {isValidDate(startsAt) ? (
        <SummarySection
          label={isRescheduling ? "Novo horário" : "Data e horário"}
        >
          <ScheduleDetails service={service} startsAt={startsAt} />
        </SummarySection>
      ) : null}
    </>
  );
}
