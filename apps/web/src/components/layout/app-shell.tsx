import type { PropsWithChildren } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { PerfilAcesso } from "@/features/auth/types";
import { UnsavedChangesContext } from "@/features/unsaved-changes";
import { type AppPage, AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

interface AppShellProps {
  onNavigate: (page: AppPage) => void;
  onSignOut: () => void;
  page: AppPage;
  userName: string;
  userRole: PerfilAcesso;
}

export function AppShell({
  children,
  onSignOut,
  onNavigate,
  page,
  userRole,
  userName,
}: PropsWithChildren<AppShellProps>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingDiscard, setPendingDiscard] = useState<(() => void) | null>(
    null
  );
  const pendingForms = useRef(new Set<{ isSaving: boolean }>());
  const cancelButton = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const register = useCallback((isSaving: boolean) => {
    const form = { isSaving };
    pendingForms.current.add(form);
    return () => {
      pendingForms.current.delete(form);
    };
  }, []);

  const requestDiscard = useCallback((discard: () => void) => {
    const focused = document.activeElement;
    previousFocus.current = focused instanceof HTMLElement ? focused : null;
    setPendingDiscard(() => discard);
  }, []);
  const guard = useMemo(
    () => ({ register, requestDiscard }),
    [register, requestDiscard]
  );

  useLayoutEffect(() => {
    if (pendingDiscard) {
      cancelButton.current?.focus();
    } else if (previousFocus.current) {
      const focused = previousFocus.current;
      previousFocus.current = null;
      if (focused.isConnected && !focused.closest("[inert]")) {
        focused.focus();
      } else {
        main.current?.focus();
      }
    }
  }, [pendingDiscard]);

  const keepEditing = useCallback(() => setPendingDiscard(null), []);
  const discardChanges = useCallback(() => {
    setPendingDiscard(null);
    pendingDiscard?.();
  }, [pendingDiscard]);

  const handleOpenMenu = useCallback(() => setIsMenuOpen(true), []);
  const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);
  const handleNavigate = useCallback(
    (nextPage: AppPage) => {
      handleCloseMenu();
      if (
        nextPage === page ||
        [...pendingForms.current].some(({ isSaving }) => isSaving)
      ) {
        return;
      }
      if (pendingForms.current.size > 0) {
        requestDiscard(() => onNavigate(nextPage));
        return;
      }
      onNavigate(nextPage);
    },
    [handleCloseMenu, onNavigate, page, requestDiscard]
  );
  const handleOpenProfile = useCallback(
    () => handleNavigate("perfil"),
    [handleNavigate]
  );

  return (
    <>
      <div
        className="flex min-h-dvh bg-zinc-950 text-zinc-100"
        inert={pendingDiscard !== null}
      >
        <aside className="hidden w-64 shrink-0 border-zinc-800 border-r bg-zinc-900/40 lg:block">
          <AppSidebar
            onNavigate={handleNavigate}
            page={page}
            perfil={userRole}
          />
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
              <AppSidebar
                onNavigate={handleNavigate}
                page={page}
                perfil={userRole}
              />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar
            onOpenMenu={handleOpenMenu}
            onOpenProfile={handleOpenProfile}
            onSignOut={onSignOut}
            page={page}
            userName={userName}
            userRole={userRole}
          />

          <main
            className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
            ref={main}
            tabIndex={-1}
          >
            <UnsavedChangesContext value={guard}>
              {children}
            </UnsavedChangesContext>
          </main>
        </div>
      </div>

      <ConfirmDialog
        cancelButtonRef={cancelButton}
        cancelLabel="Continuar editando"
        confirmLabel="Sair sem salvar"
        description="Se você sair agora, suas alterações serão perdidas."
        error={null}
        isLoading={false}
        isOpen={pendingDiscard !== null}
        onClose={keepEditing}
        onConfirm={discardChanges}
        title="Sair sem salvar?"
      />
    </>
  );
}
