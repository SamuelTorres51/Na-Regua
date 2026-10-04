import { useCallback, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { AgendaPage } from "@/pages/agenda-page";
import { LoginPage } from "@/pages/login-page";

// PROVISÓRIO: substituir pelos dados do usuário autenticado quando a
// autenticação real estiver integrada.
const CURRENT_USER = {
  name: "Administrador",
  role: "administrador",
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticated = useCallback(() => setIsAuthenticated(true), []);
  const handleSignOut = useCallback(() => setIsAuthenticated(false), []);

  if (!isAuthenticated) {
    return <LoginPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <AppShell
      onSignOut={handleSignOut}
      userName={CURRENT_USER.name}
      userRole={CURRENT_USER.role}
    >
      <AgendaPage />
    </AppShell>
  );
}
