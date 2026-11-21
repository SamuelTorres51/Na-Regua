import type {
  Barber,
  BarberProfile,
  BookingSelection,
  BookingSelectionIds,
  Service,
} from "@/types/models";
import { toPriceInCents } from "@/utils/format";
import { api, HTTP_STATUS, hasApiStatus } from "./api-client";
import { getBarberRating } from "./reviews";

interface ServiceResponse {
  ativo: boolean;
  descricao: string;
  duracaoMinutos: number;
  id: number;
  nome: string;
  preco: number;
}

interface ProfessionalResponse {
  ativo: boolean;
  id: number;
  nome: string;
}

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((first, second) =>
    first.name.localeCompare(second.name, "pt-BR")
  );
}

function toService({
  descricao,
  duracaoMinutos,
  id,
  nome,
  preco,
}: ServiceResponse): Service {
  return {
    description: descricao,
    durationMinutes: duracaoMinutos,
    id: String(id),
    name: nome,
    priceInCents: toPriceInCents(preco),
  };
}

function toBarber({ id, nome }: ProfessionalResponse): Barber {
  return { id: String(id), name: nome };
}

async function requestOrDefault<TResponse, TFallback>(
  path: string,
  fallback: TFallback
): Promise<TResponse | TFallback> {
  try {
    return await api.get<TResponse>(path);
  } catch (error) {
    if (hasApiStatus(error, HTTP_STATUS.notFound)) {
      return fallback;
    }

    throw error;
  }
}

export async function listServices(barberId?: string) {
  const path = barberId
    ? `/profissionais/${barberId}/servicos`
    : "/servicos?apenas_ativos=true";
  const responses = await requestOrDefault<ServiceResponse[], []>(path, []);

  return sortByName(
    responses.filter((response) => response.ativo).map(toService)
  );
}

export async function listBarbers(serviceId?: string) {
  const path = serviceId
    ? `/servicos/${serviceId}/profissionais`
    : "/profissionais?apenas_ativos=true";
  const responses = await requestOrDefault<ProfessionalResponse[], []>(
    path,
    []
  );

  return responses.filter((response) => response.ativo).map(toBarber);
}

async function findBarber(barberId?: string) {
  if (!barberId) {
    return;
  }

  const response = await requestOrDefault<ProfessionalResponse, null>(
    `/profissionais/${barberId}`,
    null
  );

  return response?.ativo ? toBarber(response) : undefined;
}

async function findService(serviceId?: string) {
  if (!serviceId) {
    return;
  }

  const response = await requestOrDefault<ServiceResponse, null>(
    `/servicos/${serviceId}`,
    null
  );

  return response?.ativo ? toService(response) : undefined;
}

export async function getBarberProfile(
  barberId: string
): Promise<BarberProfile | null> {
  const [barber, services, rating] = await Promise.all([
    findBarber(barberId),
    listServices(barberId),
    getBarberRating(barberId).catch(() => null),
  ]);

  return barber ? { barber, rating, services } : null;
}

export async function getBookingSelection({
  barberId,
  serviceId,
}: BookingSelectionIds): Promise<BookingSelection> {
  const [barber, service] = await Promise.all([
    findBarber(barberId),
    findService(serviceId),
  ]);

  return { barber, service };
}
