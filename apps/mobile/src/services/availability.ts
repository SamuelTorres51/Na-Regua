import type {
  BookingDay,
  BookingDayStatus,
  BookingSelectionIds,
} from "@/types/models";
import { parseDateOnly } from "@/utils/date";
import { api, HTTP_STATUS, hasApiStatus } from "./api-client";

const DAY_STATUS_FROM_API: Record<string, BookingDayStatus> = {
  disponivel: "available",
  fechado: "closed",
  folga: "dayOff",
  lotado: "full",
};

interface AvailabilityDayResponse {
  data: string;
  horarios: string[];
  status: string;
}

function toBookingDay({
  data,
  horarios,
  status,
}: AvailabilityDayResponse): BookingDay {
  return {
    date: parseDateOnly(data).toISOString(),
    slots: horarios.map((slot) => new Date(slot).toISOString()),
    status: DAY_STATUS_FROM_API[status] ?? "closed",
  };
}

function isUnbookableSelection(error: unknown) {
  return (
    hasApiStatus(error, HTTP_STATUS.notFound) ||
    hasApiStatus(error, HTTP_STATUS.conflict)
  );
}

export async function listBookingDays({
  barberId,
  serviceId,
}: BookingSelectionIds): Promise<BookingDay[]> {
  if (!(barberId && serviceId)) {
    return [];
  }

  try {
    const days = await api.get<AvailabilityDayResponse[]>(
      `/profissionais/${barberId}/disponibilidade?servico_id=${serviceId}`
    );

    return days.map(toBookingDay);
  } catch (error) {
    if (isUnbookableSelection(error)) {
      return [];
    }

    throw error;
  }
}
