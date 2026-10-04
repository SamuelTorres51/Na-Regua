import { MenuIcon, SignOutIcon } from "@/components/ui/icons";

interface AppTopbarProps {
  onOpenMenu: () => void;
  onSignOut: () => void;
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

export function AppTopbar({
  onOpenMenu,
  onSignOut,
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
            Agenda consolidada
          </p>
          <p className="hidden truncate font-roboto text-xs text-zinc-500 sm:block">
            Todos os profissionais em uma única tela
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="font-roboto-medium text-sm text-white">{userName}</p>
          <p className="font-roboto text-xs text-zinc-500 capitalize">
            {userRole}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 font-roboto-semibold text-brand text-xs"
        >
          {getInitials(userName)}
        </span>

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
