import { selectionAsync } from "expo-haptics";
import { useCallback } from "react";
import { Pressable, View } from "react-native";
import {
  describeRating,
  MAX_RATING,
  RATINGS,
} from "@/features/reviews/ratings";
import { Icon, type IconSize } from "./icon";

interface StarProps {
  isFilled: boolean;
  isSelected: boolean;
  onSelect: (rating: number) => void;
  rating: number;
}

function Star({ isFilled, isSelected, onSelect, rating }: StarProps) {
  const handlePress = useCallback(() => {
    selectionAsync();
    onSelect(rating);
  }, [onSelect, rating]);

  return (
    <Pressable
      accessibilityLabel={describeRating(rating)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className="p-1.5 active:opacity-70"
      hitSlop={4}
      onPress={handlePress}
    >
      <Icon
        name={isFilled ? "star" : "star-outline"}
        size="xl"
        tone={isFilled ? "accent" : "muted"}
      />
    </Pressable>
  );
}

interface StarRatingInputProps {
  onChange: (rating: number) => void;
  value: number;
}

export function StarRatingInput({ onChange, value }: StarRatingInputProps) {
  return (
    <View className="-mx-1.5 flex-row">
      {RATINGS.map((rating) => (
        <Star
          isFilled={rating <= value}
          isSelected={rating === value}
          key={rating}
          onSelect={onChange}
          rating={rating}
        />
      ))}
    </View>
  );
}

interface StarRatingProps {
  size?: IconSize;
  value: number;
}

export function StarRating({ size = "sm", value }: StarRatingProps) {
  return (
    <View
      accessibilityLabel={`Nota ${value} de ${MAX_RATING}`}
      accessible
      className="flex-row gap-0.5"
    >
      {RATINGS.map((rating) => (
        <Icon
          key={rating}
          name={rating <= value ? "star" : "star-outline"}
          size={size}
          tone={rating <= value ? "accent" : "muted"}
        />
      ))}
    </View>
  );
}
