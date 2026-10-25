import { useCallback, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import type { AppPage } from "@/components/layout/app-sidebar";
import { AgendaPage } from "@/pages/agenda-page";
import { ClientsPage } from "@/pages/clients-page";
import { LoginPage } from "@/pages/login-page";
import { ProfessionalsPage } from "@/pages/professionals-page";

// PROVISÓRIO: substituir pelos dados do usuário autenticado quando a
// autenticação real estiver integrada.
const CURRENT_USER = {
  name: "Administrador",
  role: "administrador",
};

function getPageContent(page: AppPage) {
  if (page === "clientes") {
    return <ClientsPage />;
  }

  if (page === "profissionais") {
    return <ProfessionalsPage />;
  }

  return <AgendaPage />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState<AppPage>("agenda");

  const handleAuthenticated = useCallback(() => setIsAuthenticated(true), []);
  const handleSignOut = useCallback(() => setIsAuthenticated(false), []);

  if (!isAuthenticated) {
    return <LoginPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <AppShell
      onNavigate={setPage}
      onSignOut={handleSignOut}
      page={page}
      userName={CURRENT_USER.name}
      userRole={CURRENT_USER.role}
    >
      {getPageContent(page)}
    </AppShell>
  );
}
