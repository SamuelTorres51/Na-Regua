import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { classNames } from "@/theme/class-names";
import type { Service } from "@/types/models";
import { formatDuration, formatPrice } from "@/utils/format";

interface ServiceCardProps {
  onSelect: (service: Service) => void;
  service: Service;
}

export function ServiceCard({ onSelect, service }: ServiceCardProps) {
  const duration = formatDuration(service.durationMinutes);
  const price = formatPrice(service.priceInCents);

  const handlePress = useCallback(() => onSelect(service), [onSelect, service]);

  return (
    <Pressable
      accessibilityHint="Abre o agendamento com este serviço"
      accessibilityLabel={`${service.name}, ${duration}, ${price}`}
      accessibilityRole="button"
      className={`p-5 active:opacity-80 ${classNames.card}`}
      onPress={handlePress}
    >
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 font-roboto-semibold text-lg text-white">
          {service.name}
        </Text>
        <Text className="ml-4 font-roboto-semibold text-base text-brand">
          {price}
        </Text>
      </View>

      <Text className="mt-1.5 font-roboto text-sm text-zinc-400 leading-5">
        {service.description}
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Icon name="time-outline" size="sm" tone="subtle" />
          <Text className="ml-1.5 font-roboto-medium text-sm text-zinc-300">
            {duration}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className="mr-1 font-roboto-medium text-brand text-sm">
            Agendar
          </Text>
          <Icon name="chevron-forward" size="sm" tone="accent" />
        </View>
      </View>
    </Pressable>
  );
}
