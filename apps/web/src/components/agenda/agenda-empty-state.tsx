import type { ComponentType, SVGProps } from "react";

import { CalendarOffIcon } from "@/components/ui/icons";

interface AgendaEmptyStateProps {
  description: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
}

export function AgendaEmptyState({
  description,
  icon: IconComponent = CalendarOffIcon,
  title,
}: AgendaEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-800 border-dashed bg-zinc-900/30 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/60 text-zinc-400">
        <IconComponent className="h-6 w-6" />
      </span>
      <p className="font-roboto-semibold text-base text-white">{title}</p>
      <p className="max-w-sm font-roboto text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}
