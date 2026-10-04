import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "@/features/agenda/status";
import type { StatusAgendamento } from "@/features/agenda/types";

interface StatusBadgeProps {
  status: StatusAgendamento;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-roboto-medium text-xs ${STATUS_BADGE_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
