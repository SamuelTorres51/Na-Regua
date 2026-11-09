import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import type { AppPage } from "@/components/layout/app-sidebar";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { canAccessPage, isAdministrador } from "@/features/auth/permissions";
import { useSession } from "@/features/auth/session-provider";
import type { PerfilAcesso } from "@/features/auth/types";
import { AgendaPage } from "@/pages/agenda-page";
import { ClientsPage } from "@/pages/clients-page";
import { LoginPage } from "@/pages/login-page";
import { ProfessionalsPage } from "@/pages/professionals-page";
import { ServicesPage } from "@/pages/services-page";

const DEFAULT_PAGE: AppPage = "agenda";

function getPageContent(page: AppPage, perfil: PerfilAcesso) {
  if (page === "clientes") {
    return <ClientsPage />;
  }

  if (page === "profissionais") {
    return <ProfessionalsPage />;
  }

  if (page === "servicos") {
    return <ServicesPage canManage={isAdministrador(perfil)} />;
  }

  return <AgendaPage />;
}

export default function App() {
  const { isLoading, session, signOut } = useSession();
  const [page, setPage] = useState<AppPage>(DEFAULT_PAGE);

  if (isLoading) {
    return <LoadingScreen label="Carregando sua sessão..." />;
  }

  if (!session) {
    return <LoginPage />;
  }

  const { nome, perfil } = session.usuario;
  const currentPage = canAccessPage(perfil, page) ? page : DEFAULT_PAGE;

  return (
    <AppShell
      onNavigate={setPage}
      onSignOut={signOut}
      page={currentPage}
      userName={nome}
      userRole={perfil}
    >
      {getPageContent(currentPage, perfil)}
    </AppShell>
  );
}
