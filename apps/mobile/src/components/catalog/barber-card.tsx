import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { PersonSummary } from "@/components/ui/person-summary";
import { TagList } from "@/components/ui/tag-list";
import { classNames } from "@/theme/class-names";
import type { Barber } from "@/types/models";

interface BarberCardProps {
  barber: Barber;
  onSelect: (barber: Barber) => void;
}

export function BarberCard({ barber, onSelect }: BarberCardProps) {
  const handlePress = useCallback(() => onSelect(barber), [barber, onSelect]);

  return (
    <Pressable
      accessibilityHint="Abre o perfil do profissional"
      accessibilityLabel={`${barber.name}, ${barber.role}`}
      accessibilityRole="button"
      className={`p-5 active:opacity-80 ${classNames.card}`}
      onPress={handlePress}
    >
      <PersonSummary
        description={barber.role}
        name={barber.name}
        trailing={<Icon name="chevron-forward" size="sm" tone="muted" />}
      />
      <View className="mt-4">
        <TagList labels={barber.specialities} />
      </View>
    </Pressable>
  );
}
