import type { AuthSession } from "@/features/auth/types";

const SESSION_KEY = "naregua.session";

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { token, usuario } = value as Partial<AuthSession>;

  return (
    typeof token === "string" &&
    token.length > 0 &&
    typeof usuario === "object" &&
    usuario !== null
  );
}

function parseSession(stored: string): AuthSession | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    return isAuthSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readStoredSession() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function loadSession(): AuthSession | null {
  const stored = readStoredSession();

  if (!stored) {
    return null;
  }

  const session = parseSession(stored);

  if (!session) {
    clearSession();
  }

  return session;
}

export function saveSession(session: AuthSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Sem armazenamento disponível, a sessão dura só enquanto a aba estiver aberta.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Com o armazenamento indisponível, não há sessão salva para remover.
  }
}
