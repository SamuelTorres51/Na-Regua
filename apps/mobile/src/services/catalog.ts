import type {
  Barber,
  BarberProfile,
  BookingSelection,
  BookingSelectionIds,
  Service,
} from "@/types/models";
import { api, HTTP_STATUS, hasApiStatus, isApiEnabled } from "./api-client";
import { simulateLatency } from "./fake-api";
import { BARBER_SERVICE_IDS, BARBERS, SERVICES } from "./mock-data";

const CENTS_PER_UNIT = 100;

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
    priceInCents: Math.round(preco * CENTS_PER_UNIT),
  };
}

function toBarber({ id, nome }: ProfessionalResponse): Barber {
  return { id: String(id), name: nome };
}

function toActiveServices(responses: ServiceResponse[]) {
  return sortByName(
    responses.filter((response) => response.ativo).map(toService)
  );
}

function toActiveBarbers(responses: ProfessionalResponse[]) {
  return responses.filter((response) => response.ativo).map(toBarber);
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

function listMockBarberServices(barberId: string) {
  const serviceIds = BARBER_SERVICE_IDS[barberId] ?? [];

  return SERVICES.filter((service) => serviceIds.includes(service.id));
}

async function listServicesWithMock(barberId?: string) {
  await simulateLatency();

  return sortByName(barberId ? listMockBarberServices(barberId) : SERVICES);
}

async function listServicesWithApi(barberId?: string) {
  const path = barberId
    ? `/profissionais/${barberId}/servicos`
    : "/servicos?apenas_ativos=true";
  const responses = await requestOrDefault<ServiceResponse[], []>(path, []);

  return toActiveServices(responses);
}

async function listBarbersWithMock(serviceId?: string) {
  await simulateLatency();

  if (!serviceId) {
    return BARBERS;
  }

  return BARBERS.filter((barber) =>
    BARBER_SERVICE_IDS[barber.id]?.includes(serviceId)
  );
}

async function listBarbersWithApi(serviceId?: string) {
  const path = serviceId
    ? `/servicos/${serviceId}/profissionais`
    : "/profissionais?apenas_ativos=true";
  const responses = await requestOrDefault<ProfessionalResponse[], []>(
    path,
    []
  );

  return toActiveBarbers(responses);
}

function findBarberWithMock(barberId?: string) {
  return Promise.resolve(BARBERS.find((barber) => barber.id === barberId));
}

async function findBarberWithApi(barberId?: string) {
  if (!barberId) {
    return;
  }

  const response = await requestOrDefault<ProfessionalResponse, null>(
    `/profissionais/${barberId}`,
    null
  );

  return response?.ativo ? toBarber(response) : undefined;
}

function findServiceWithMock(serviceId?: string) {
  return Promise.resolve(SERVICES.find((service) => service.id === serviceId));
}

async function findServiceWithApi(serviceId?: string) {
  if (!serviceId) {
    return;
  }

  const response = await requestOrDefault<ServiceResponse, null>(
    `/servicos/${serviceId}`,
    null
  );

  return response?.ativo ? toService(response) : undefined;
}

export const findBarber = isApiEnabled ? findBarberWithApi : findBarberWithMock;
export const findService = isApiEnabled
  ? findServiceWithApi
  : findServiceWithMock;
export const listServices = isApiEnabled
  ? listServicesWithApi
  : listServicesWithMock;
export const listBarbers = isApiEnabled
  ? listBarbersWithApi
  : listBarbersWithMock;

export async function canBarberPerformService(
  barberId: string,
  serviceId: string
) {
  if (!isApiEnabled) {
    return BARBER_SERVICE_IDS[barberId]?.includes(serviceId) ?? false;
  }

  const services = await listServicesWithApi(barberId);

  return services.some((service) => service.id === serviceId);
}

export async function getBarberProfile(
  barberId: string
): Promise<BarberProfile | null> {
  if (!isApiEnabled) {
    await simulateLatency();
  }

  const [barber, services] = await Promise.all([
    findBarber(barberId),
    isApiEnabled
      ? listServicesWithApi(barberId)
      : sortByName(listMockBarberServices(barberId)),
  ]);

  return barber ? { barber, services } : null;
}

export async function getBookingSelection({
  barberId,
  serviceId,
}: BookingSelectionIds): Promise<BookingSelection> {
  if (!isApiEnabled) {
    await simulateLatency();
  }

  const [barber, service] = await Promise.all([
    findBarber(barberId),
    findService(serviceId),
  ]);

  return { barber, service };
}
