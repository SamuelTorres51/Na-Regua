import type { Service, ServiceCategory } from "@/types/models";

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  aesthetics: "Estética",
  beard: "Barba",
  hair: "Cabelo",
  manicure: "Manicure",
  wigs: "Perucas",
};

const CATEGORY_ORDER: ServiceCategory[] = [
  "hair",
  "beard",
  "manicure",
  "aesthetics",
  "wigs",
];

export interface ServiceGroup {
  category: ServiceCategory;
  services: Service[];
}

export function groupServicesByCategory(services: Service[]): ServiceGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    services: services.filter((service) => service.category === category),
  })).filter((group) => group.services.length > 0);
}
