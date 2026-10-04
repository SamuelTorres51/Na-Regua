import type { PropsWithChildren } from "react";
import { useCallback, useState } from "react";

import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

interface AppShellProps {
  onSignOut: () => void;
  userName: string;
  userRole: string;
}

export function AppShell({
  children,
  onSignOut,
  userRole,
  userName,
}: PropsWithChildren<AppShellProps>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenMenu = useCallback(() => setIsMenuOpen(true), []);
  const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <div className="flex min-h-dvh bg-zinc-950 text-zinc-100">
      <aside className="hidden w-64 shrink-0 border-zinc-800 border-r bg-zinc-900/40 lg:block">
        <AppSidebar />
      </aside>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
            onClick={handleCloseMenu}
            type="button"
          />
          <aside className="relative h-full w-72 animate-fade-in border-zinc-800 border-r bg-zinc-900">
            <AppSidebar />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          onOpenMenu={handleOpenMenu}
          onSignOut={onSignOut}
          userName={userName}
          userRole={userRole}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
