import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { colors } from "@/theme/colors";
import { metrics } from "@/theme/metrics";

export type IconName = ComponentProps<typeof Ionicons>["name"];
export type IconSize = keyof typeof metrics.icon;
export type IconTone = keyof typeof colors.icon;

interface IconProps {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
}

export function Icon({ name, size = "md", tone = "default" }: IconProps) {
  return (
    <Ionicons color={colors.icon[tone]} name={name} size={metrics.icon[size]} />
  );
}
