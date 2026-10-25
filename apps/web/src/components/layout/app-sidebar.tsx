import type { ComponentType, SVGProps } from "react";

import { BrandMark } from "@/components/ui/brand-mark";
import {
  CalendarIcon,
  ProfessionalsIcon,
  ScissorsIcon,
  StoreIcon,
  UsersIcon,
} from "@/components/ui/icons";

interface NavItem {
  enabled: boolean;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  page?: AppPage;
}

export type AppPage = "agenda" | "clientes" | "profissionais";

const NAV_ITEMS: NavItem[] = [
  { enabled: true, icon: CalendarIcon, label: "Agenda", page: "agenda" },
  { enabled: true, icon: UsersIcon, label: "Clientes", page: "clientes" },
  { enabled: false, icon: ScissorsIcon, label: "Serviços" },
  {
    enabled: true,
    icon: ProfessionalsIcon,
    label: "Profissionais",
    page: "profissionais",
  },
  { enabled: false, icon: StoreIcon, label: "Barbearia" },
];

function getNavItemClass(isActive: boolean, enabled: boolean) {
  if (isActive) {
    return "flex w-full items-center gap-3 rounded-xl bg-brand/10 px-3 py-2.5 text-left font-roboto-medium text-brand text-sm";
  }

  if (enabled) {
    return "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-roboto text-sm text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-white";
  }

  return "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-roboto text-sm text-zinc-500";
}

interface AppSidebarProps {
  onNavigate: (page: AppPage) => void;
  page: AppPage;
}

export function AppSidebar({ onNavigate, page }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col px-5 py-6">
      <BrandMark />

      <nav aria-label="Navegação principal" className="mt-10">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(
            ({ enabled, icon: IconComponent, label, page: itemPage }) => {
              const isActive = enabled && itemPage === page;

              return (
                <li key={label}>
                  <button
                    aria-current={isActive ? "page" : undefined}
                    aria-disabled={enabled ? undefined : true}
                    className={getNavItemClass(isActive, enabled)}
                    // biome-ignore lint/performance/noJsxPropsBind: navigation depends on the selected item
                    onClick={() => {
                      if (enabled && itemPage) {
                        onNavigate(itemPage);
                      }
                    }}
                    type="button"
                  >
                    <IconComponent className="h-5 w-5" />
                    {label}
                    {enabled ? null : (
                      <span className="ml-auto font-roboto text-[10px] text-zinc-600 uppercase tracking-wide">
                        em breve
                      </span>
                    )}
                  </button>
                </li>
              );
            }
          )}
        </ul>
      </nav>

      <p className="mt-auto font-roboto text-xs text-zinc-600 leading-relaxed">
        Na Régua · Painel administrativo
      </p>
    </div>
  );
}
