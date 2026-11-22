import { MenuIcon, SignOutIcon } from "@/components/ui/icons";
import type { AppPage } from "./app-sidebar";

interface AppTopbarProps {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
  page: AppPage;
  userName: string;
  userRole: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getPageTitle(page: AppPage) {
  if (page === "avaliacoes") {
    return "Avaliações";
  }

  if (page === "barbearia") {
    return "Barbearia";
  }

  if (page === "clientes") {
    return "Gerenciamento de clientes";
  }

  if (page === "perfil") {
    return "Meu perfil";
  }

  if (page === "profissionais") {
    return "Gerenciamento de profissionais";
  }

  if (page === "servicos") {
    return "Gerenciamento de serviços";
  }

  return "Agenda consolidada";
}

function getPageSubtitle(page: AppPage, userRole: string) {
  if (page === "avaliacoes") {
    return "Notas e comentários dos atendimentos";
  }

  if (page === "barbearia") {
    return "Horários de funcionamento";
  }
  if (page === "clientes") {
    return "Cadastros da sua barbearia";
  }

  if (page === "perfil") {
    return "Dados da conta e senha";
  }

  if (page === "profissionais") {
    return "Cadastro e status da equipe";
  }

  if (page === "servicos") {
    return "Catálogo de serviços da sua barbearia";
  }

  return userRole === "profissional"
    ? "Seus atendimentos em uma única tela"
    : "Todos os profissionais em uma única tela";
}

export function AppTopbar({
  onOpenMenu,
  onOpenProfile,
  onSignOut,
  page,
  userRole,
  userName,
}: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-zinc-800 border-b bg-zinc-950/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white lg:hidden"
          onClick={onOpenMenu}
          type="button"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate font-roboto-semibold text-sm text-white">
            {getPageTitle(page)}
          </p>
          <p className="hidden truncate font-roboto text-xs text-zinc-500 sm:block">
            {getPageSubtitle(page, userRole)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          aria-current={page === "perfil" ? "page" : undefined}
          aria-label="Meu perfil"
          className="flex min-w-0 items-center gap-3 rounded-xl p-1 text-right transition hover:bg-zinc-800/60"
          onClick={onOpenProfile}
          title="Meu perfil"
          type="button"
        >
          <span className="hidden min-w-0 max-w-52 sm:block">
            <span className="block truncate font-roboto-medium text-sm text-white">
              {userName}
            </span>
            <span className="block font-roboto text-xs text-zinc-500 capitalize">
              {userRole}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 font-roboto-semibold text-brand text-xs"
          >
            {getInitials(userName)}
          </span>
        </button>

        <button
          className="flex h-10 items-center gap-2 rounded-xl border border-zinc-800 px-3 font-roboto-medium text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
          onClick={onSignOut}
          type="button"
        >
          <SignOutIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
