import { Text, View } from "react-native";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  LOAD_ERROR_MESSAGE,
  StateMessage,
} from "@/components/feedback/state-message";
import {
  CATEGORY_LABELS,
  groupServicesByCategory,
} from "@/features/catalog/categories";
import type { Service } from "@/types/models";
import { ServiceCard } from "./service-card";

interface ServiceListProps {
  hasLoadError: boolean;
  isLoading: boolean;
  onSelect: (service: Service) => void;
  services: Service[];
}

export function ServiceList({
  hasLoadError,
  isLoading,
  onSelect,
  services,
}: ServiceListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (hasLoadError) {
    return <StateMessage {...LOAD_ERROR_MESSAGE} />;
  }

  if (services.length === 0) {
    return (
      <StateMessage
        description="A barbearia ainda não cadastrou seus serviços."
        icon="cut-outline"
        title="Nenhum serviço disponível"
      />
    );
  }

  return (
    <View className="gap-8">
      {groupServicesByCategory(services).map((group) => (
        <View key={group.category}>
          <Text
            accessibilityRole="header"
            className="mb-3 font-roboto-medium text-sm text-zinc-400"
          >
            {CATEGORY_LABELS[group.category]}
          </Text>
          <View className="gap-3">
            {group.services.map((service) => (
              <ServiceCard
                key={service.id}
                onSelect={onSelect}
                service={service}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
