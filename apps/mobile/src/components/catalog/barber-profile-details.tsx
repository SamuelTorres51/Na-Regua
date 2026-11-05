import { Text, View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import { PersonSummary } from "@/components/ui/person-summary";
import { PrimaryButton } from "@/components/ui/primary-button";
import { TagList } from "@/components/ui/tag-list";
import { classNames } from "@/theme/class-names";
import type { BarberProfile, Service } from "@/types/models";
import { getFirstName } from "@/utils/format";
import { ServiceCard } from "./service-card";

const SECTION_TITLE_CLASS_NAME =
  "mb-3 font-roboto-medium text-sm text-zinc-400";

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

  const { barber, services } = profile;

  return (
    <View className="gap-8">
      <View className={`p-5 ${classNames.card}`}>
        <PersonSummary description={barber.role} name={barber.name} />
      </View>

      <View>
        <Text accessibilityRole="header" className={SECTION_TITLE_CLASS_NAME}>
          Especialidades
        </Text>
        <TagList labels={barber.specialities} />
      </View>

      <View>
        <Text accessibilityRole="header" className={SECTION_TITLE_CLASS_NAME}>
          Serviços
        </Text>
        <View className="gap-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              onSelect={onSelectService}
              service={service}
            />
          ))}
        </View>
      </View>

      <PrimaryButton
        accessibilityLabel={`Agendar com ${barber.name}`}
        label={`Agendar com ${getFirstName(barber.name)}`}
        onPress={onBook}
      />
    </View>
  );
}
