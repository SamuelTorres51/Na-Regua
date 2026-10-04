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
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: CalendarIcon, isActive: true, label: "Agenda" },
  { icon: UsersIcon, label: "Clientes" },
  { icon: ScissorsIcon, label: "Serviços" },
  { icon: ProfessionalsIcon, label: "Profissionais" },
  { icon: StoreIcon, label: "Barbearia" },
];

export function AppSidebar() {
  return (
    <div className="flex h-full flex-col px-5 py-6">
      <BrandMark />

      <nav aria-label="Navegação principal" className="mt-10">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ icon: IconComponent, isActive, label }) => (
            <li key={label}>
              <span
                aria-current={isActive ? "page" : undefined}
                aria-disabled={isActive ? undefined : true}
                className={
                  isActive
                    ? "flex items-center gap-3 rounded-xl bg-brand/10 px-3 py-2.5 font-roboto-medium text-brand text-sm"
                    : "flex items-center gap-3 rounded-xl px-3 py-2.5 font-roboto text-sm text-zinc-500"
                }
              >
                <IconComponent className="h-5 w-5" />
                {label}
                {isActive ? null : (
                  <span className="ml-auto font-roboto text-[10px] text-zinc-600 uppercase tracking-wide">
                    em breve
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-auto font-roboto text-xs text-zinc-600 leading-relaxed">
        Na Régua · Painel administrativo
      </p>
    </div>
  );
}
