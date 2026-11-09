import type { AppPage } from "@/components/layout/app-sidebar";
import type { PerfilAcesso } from "./types";

const PANEL_ROLES: readonly PerfilAcesso[] = ["administrador", "profissional"];

const PAGE_ROLES: Record<AppPage, readonly PerfilAcesso[]> = {
  agenda: ["administrador", "profissional"],
  clientes: ["administrador"],
  profissionais: ["administrador"],
  servicos: ["administrador", "profissional"],
};

export function isAdministrador(perfil: PerfilAcesso) {
  return perfil === "administrador";
}

export function canAccessPanel(perfil: PerfilAcesso) {
  return PANEL_ROLES.includes(perfil);
}

export function canAccessPage(perfil: PerfilAcesso, page: AppPage) {
  return PAGE_ROLES[page].includes(perfil);
}
