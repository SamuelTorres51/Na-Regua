import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  alterarSenha,
  atualizarPerfil,
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
import type {
  AlterarSenhaInput,
  AtualizarPerfilInput,
  AuthSession,
  Usuario,
} from "./types";

interface SessionContextValue {
  changePassword: (input: AlterarSenhaInput) => Promise<string>;
  hasSessionExpired: boolean;
  isLoading: boolean;
  isUpdatingAccount: boolean;
  session: AuthSession | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => void;
  updateProfile: (input: AtualizarPerfilInput) => Promise<Usuario>;
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

async function restoreSession(
  isCurrent: () => boolean
): Promise<AuthSession | null> {
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
    if (isCurrent()) {
      saveSession(refreshedSession);
    }
    return refreshedSession;
  } catch (error) {
    if (isRevokedSession(error)) {
      if (isCurrent()) {
        endStoredSession();
      }
      return null;
    }

    return storedSession;
  }
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSessionExpired, setHasSessionExpired] = useState(false);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const currentSession = useRef<AuthSession | null>(null);
  const updatingAccount = useRef<boolean>(false);

  const applySession = useCallback((nextSession: AuthSession | null) => {
    currentSession.current = nextSession;
    setSession(nextSession);
  }, []);

  const expireSession = useCallback(() => {
    endStoredSession();
    setHasSessionExpired(true);
    applySession(null);
  }, [applySession]);

  useEffect(() => {
    setUnauthorizedHandler(expireSession);
    return () => setUnauthorizedHandler(null);
  }, [expireSession]);

  useEffect(() => {
    let isActive = true;

    restoreSession(() => isActive)
      .then((restored) => {
        if (isActive) {
          applySession(restored);
        }
      })
      .catch(() => {
        if (isActive) {
          applySession(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [applySession]);

  const signIn = useCallback(
    async (input: SignInInput) => {
      const nextSession = await requestSignIn(input);

      saveSession(nextSession);
      setAccessToken(nextSession.token);
      setHasSessionExpired(false);
      applySession(nextSession);
    },
    [applySession]
  );

  const signOut = useCallback(() => {
    endStoredSession();
    setHasSessionExpired(false);
    applySession(null);
  }, [applySession]);

  const runAccountUpdate = useCallback(
    async <T,>(operation: (activeSession: AuthSession) => Promise<T>) => {
      const activeSession = currentSession.current;
      if (!activeSession || updatingAccount.current) {
        throw new Error("A atualização da conta não está disponível.");
      }

      updatingAccount.current = true;
      setIsUpdatingAccount(true);
      try {
        return await operation(activeSession);
      } finally {
        updatingAccount.current = false;
        setIsUpdatingAccount(false);
      }
    },
    []
  );

  const updateProfile = useCallback(
    (input: AtualizarPerfilInput) =>
      runAccountUpdate(async (activeSession) => {
        const usuario = await atualizarPerfil(input);
        if (currentSession.current !== activeSession) {
          throw new Error("A sessão foi alterada durante a atualização.");
        }

        const nextSession = { ...activeSession, usuario };
        saveSession(nextSession);
        applySession(nextSession);
        return usuario;
      }),
    [applySession, runAccountUpdate]
  );

  const changePassword = useCallback(
    (input: AlterarSenhaInput) => runAccountUpdate(() => alterarSenha(input)),
    [runAccountUpdate]
  );

  const value = useMemo(
    () => ({
      changePassword,
      hasSessionExpired,
      isLoading,
      isUpdatingAccount,
      session,
      signIn,
      signOut,
      updateProfile,
    }),
    [
      changePassword,
      hasSessionExpired,
      isLoading,
      isUpdatingAccount,
      session,
      signIn,
      signOut,
      updateProfile,
    ]
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
