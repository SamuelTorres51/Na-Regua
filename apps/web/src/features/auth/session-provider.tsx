import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  HTTP_STATUS,
  hasApiStatus,
  isApiEnabled,
  setAccessToken,
  setUnauthorizedHandler,
} from "@/services/api-client";
import {
  getCurrentUser,
  PanelAccessDeniedError,
  signIn as requestSignIn,
  type SignInInput,
} from "@/services/auth";
import {
  clearSession,
  loadSession,
  saveSession,
} from "@/services/session-storage";
import type { AuthSession } from "./types";

interface SessionContextValue {
  hasSessionExpired: boolean;
  isLoading: boolean;
  session: AuthSession | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function isRevokedSession(error: unknown) {
  return (
    hasApiStatus(error, HTTP_STATUS.unauthorized) ||
    error instanceof PanelAccessDeniedError
  );
}

function endStoredSession() {
  setAccessToken(null);
  clearSession();
}

async function restoreSession(): Promise<AuthSession | null> {
  const storedSession = loadSession();

  if (!storedSession) {
    return null;
  }

  setAccessToken(storedSession.token);

  if (!isApiEnabled) {
    return storedSession;
  }

  try {
    const refreshedSession = {
      ...storedSession,
      usuario: await getCurrentUser(),
    };
    saveSession(refreshedSession);
    return refreshedSession;
  } catch (error) {
    if (isRevokedSession(error)) {
      endStoredSession();
      return null;
    }

    return storedSession;
  }
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSessionExpired, setHasSessionExpired] = useState(false);

  const expireSession = useCallback(() => {
    endStoredSession();
    setHasSessionExpired(true);
    setSession(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(expireSession);
    return () => setUnauthorizedHandler(null);
  }, [expireSession]);

  useEffect(() => {
    restoreSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (input: SignInInput) => {
    const nextSession = await requestSignIn(input);

    saveSession(nextSession);
    setAccessToken(nextSession.token);
    setHasSessionExpired(false);
    setSession(nextSession);
  }, []);

  const signOut = useCallback(() => {
    endStoredSession();
    setHasSessionExpired(false);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ hasSessionExpired, isLoading, session, signIn, signOut }),
    [hasSessionExpired, isLoading, session, signIn, signOut]
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const context = use(SessionContext);

  if (!context) {
    throw new Error("useSession deve ser usado dentro de SessionProvider.");
  }

  return context;
}
