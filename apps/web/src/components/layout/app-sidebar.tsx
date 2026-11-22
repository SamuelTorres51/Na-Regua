import type { ComponentType, SVGProps } from "react";

import { BrandMark } from "@/components/ui/brand-mark";
import {
  CalendarIcon,
  ProfessionalsIcon,
  ScissorsIcon,
  StarIcon,
  StoreIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { canAccessPage } from "@/features/auth/permissions";
import type { PerfilAcesso } from "@/features/auth/types";

interface NavItem {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  page: AppPage;
}

export type AppPage =
  | "agenda"
  | "avaliacoes"
  | "barbearia"
  | "clientes"
  | "perfil"
  | "profissionais"
  | "servicos";

const NAV_ITEMS: NavItem[] = [
  { icon: CalendarIcon, label: "Agenda", page: "agenda" },
  { icon: UsersIcon, label: "Clientes", page: "clientes" },
  { icon: ScissorsIcon, label: "Serviços", page: "servicos" },
  {
    icon: ProfessionalsIcon,
    label: "Profissionais",
    page: "profissionais",
  },
  { icon: StarIcon, label: "Avaliações", page: "avaliacoes" },
  { icon: StoreIcon, label: "Barbearia", page: "barbearia" },
  { icon: UserIcon, label: "Meu perfil", page: "perfil" },
];

function getNavItemClass(isActive: boolean) {
  return isActive
    ? "flex w-full items-center gap-3 rounded-xl bg-brand/10 px-3 py-2.5 text-left font-roboto-medium text-brand text-sm"
    : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-roboto text-sm text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-white";
}

interface AppSidebarProps {
  onNavigate: (page: AppPage) => void;
  page: AppPage;
  perfil: PerfilAcesso;
}

export function AppSidebar({ onNavigate, page, perfil }: AppSidebarProps) {
  const navItems = NAV_ITEMS.filter((item) => canAccessPage(perfil, item.page));

  return (
    <div className="flex h-full flex-col px-5 py-6">
      <BrandMark />

      <nav aria-label="Navegação principal" className="mt-10">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ icon: IconComponent, label, page: itemPage }) => {
            const isActive = itemPage === page;

            return (
              <li key={itemPage}>
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={getNavItemClass(isActive)}
                  // biome-ignore lint/performance/noJsxPropsBind: navigation depends on the selected item
                  onClick={() => onNavigate(itemPage)}
                  type="button"
                >
                  <IconComponent className="h-5 w-5" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="mt-auto font-roboto text-xs text-zinc-600 leading-relaxed">
        Na Régua · Painel administrativo
      </p>
    </div>
  );
}
