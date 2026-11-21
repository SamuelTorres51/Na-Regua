import { Text, View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import { Icon } from "@/components/ui/icon";
import { PersonSummary } from "@/components/ui/person-summary";
import { PrimaryButton } from "@/components/ui/primary-button";
import { classNames } from "@/theme/class-names";
import type { BarberProfile, BarberRating, Service } from "@/types/models";
import { formatRating, getFirstName } from "@/utils/format";
import { ServiceCard } from "./service-card";

const SECTION_TITLE_CLASS_NAME =
  "mb-3 font-roboto-medium text-sm text-zinc-400";

function describeReviewCount(total: number) {
  return total === 1 ? "1 avaliação" : `${total} avaliações`;
}

interface RatingSummaryProps {
  rating: BarberRating;
}

function RatingSummary({ rating }: RatingSummaryProps) {
  if (rating.average === null || rating.total === 0) {
    return (
      <Text className="mt-4 font-roboto text-sm text-zinc-500">
        Ainda sem avaliações
      </Text>
    );
  }

  const average = formatRating(rating.average);
  const count = describeReviewCount(rating.total);

  return (
    <View
      accessibilityLabel={`Média ${average} de 5, com ${count}`}
      accessible
      className="mt-4 flex-row items-center"
    >
      <Icon name="star" size="sm" tone="accent" />
      <Text className="ml-1.5 font-roboto-semibold text-base text-white">
        {average}
      </Text>
      <Text className="ml-1.5 font-roboto text-sm text-zinc-400">
        · {count}
      </Text>
    </View>
  );
}

interface BarberProfileDetailsProps {
  hasLoadError: boolean;
  isLoading: boolean;
  onBook: () => void;
  onSelectService: (service: Service) => void;
  profile: BarberProfile | null;
}

export function BarberProfileDetails({
  hasLoadError,
  isLoading,
  onBook,
  onSelectService,
  profile,
}: BarberProfileDetailsProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (hasLoadError) {
    return <StateMessage {...LOAD_ERROR_MESSAGE} />;
  }

  if (!profile) {
    return (
      <StateMessage
        description="Este profissional não está mais disponível."
        icon="person-outline"
        title="Profissional não encontrado"
      />
    );
  }

  const { barber, rating, services } = profile;

  return (
    <View className="gap-8">
      <View className={`p-5 ${classNames.card}`}>
        <PersonSummary name={barber.name} />
        {rating ? <RatingSummary rating={rating} /> : null}
      </View>

      <View>
        <Text accessibilityRole="header" className={SECTION_TITLE_CLASS_NAME}>
          Serviços
        </Text>
        {services.length > 0 ? (
          <View className="gap-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                onSelect={onSelectService}
                service={service}
              />
            ))}
          </View>
        ) : (
          <StateMessage
            description="Este profissional ainda não tem serviços disponíveis."
            icon="cut-outline"
            title="Nenhum serviço disponível"
            variant="card"
          />
        )}
      </View>

      <PrimaryButton
        accessibilityLabel={`Agendar com ${barber.name}`}
        label={`Agendar com ${getFirstName(barber.name)}`}
        onPress={onBook}
      />
    </View>
  );
}
