import { useQueryData } from "@/hooks/use-query-data";
import { getBookingSelection } from "@/services/catalog";
import type { BookingSelection, BookingSelectionIds } from "@/types/models";

const NO_SELECTION: BookingSelection = {};

export function useBookingSelection({
  barberId,
  serviceId,
}: BookingSelectionIds) {
  const { data: selection } = useQueryData(
    ["booking-selection", barberId ?? "", serviceId ?? ""],
    () => getBookingSelection({ barberId, serviceId }),
    NO_SELECTION
  );

  return selection;
}
