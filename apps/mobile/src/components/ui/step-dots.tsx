import { View } from "react-native";

interface StepDotsProps {
  activeIndex: number;
  steps: readonly string[];
}

export function StepDots({ activeIndex, steps }: StepDotsProps) {
  return (
    <View className="mt-8 flex-row gap-2">
      {steps.map((step, index) => (
        <View
          className={
            index === activeIndex
              ? "h-1.5 w-7 rounded-full bg-brand"
              : "h-1.5 w-1.5 rounded-full bg-zinc-700"
          }
          key={step}
        />
      ))}
    </View>
  );
}
