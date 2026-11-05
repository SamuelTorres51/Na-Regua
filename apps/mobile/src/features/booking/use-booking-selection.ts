import { useCallback } from "react";
import { useAsyncData } from "@/hooks/use-async-data";
import { getBookingSelection } from "@/services/catalog";
import type { BookingSelection, BookingSelectionIds } from "@/types/models";

const NO_SELECTION: BookingSelection = {};

export function useBookingSelection({
  barberId,
  serviceId,
}: BookingSelectionIds) {
  const loadSelection = useCallback(
    () => getBookingSelection({ barberId, serviceId }),
    [barberId, serviceId]
  );
  const { data: selection } = useAsyncData(loadSelection, NO_SELECTION);

  return selection;
}
