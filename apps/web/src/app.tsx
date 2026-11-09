import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import type { AppPage } from "@/components/layout/app-sidebar";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useSession } from "@/features/auth/session-provider";
import { AgendaPage } from "@/pages/agenda-page";
import { ClientsPage } from "@/pages/clients-page";
import { LoginPage } from "@/pages/login-page";
import { ProfessionalsPage } from "@/pages/professionals-page";
import { ServicesPage } from "@/pages/services-page";

function getPageContent(page: AppPage) {
  if (page === "clientes") {
    return <ClientsPage />;
  }

  if (page === "profissionais") {
    return <ProfessionalsPage />;
  }

  if (page === "servicos") {
    return <ServicesPage />;
  }

  return <AgendaPage />;
}

export default function App() {
  const { isLoading, session, signOut } = useSession();
  const [page, setPage] = useState<AppPage>("agenda");

  if (isLoading) {
    return <LoadingScreen label="Carregando sua sessão..." />;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <AppShell
      onNavigate={setPage}
      onSignOut={signOut}
      page={page}
      userName={session.usuario.nome}
      userRole={session.usuario.perfil}
    >
      {getPageContent(page)}
    </AppShell>
  );
}
