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
  signIn as requestSignIn,
  signUp as requestSignUp,
  updateProfile as requestUpdateProfile,
  type SignInInput,
  type SignUpInput,
  type UpdateProfileInput,
} from "@/services/auth";
import {
  clearSession,
  loadSession,
  saveSession,
} from "@/services/session-storage";
import type { AuthSession } from "@/types/models";

interface SessionContextValue {
  isLoading: boolean;
  session: AuthSession | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  updateProfile: (changes: UpdateProfileInput) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));
  }, []);

  const startSession = useCallback(async (nextSession: AuthSession) => {
    await saveSession(nextSession);
    setSession(nextSession);
  }, []);

  const signIn = useCallback(
    async (input: SignInInput) => startSession(await requestSignIn(input)),
    [startSession]
  );

  const signUp = useCallback(
    async (input: SignUpInput) => startSession(await requestSignUp(input)),
    [startSession]
  );

  const updateProfile = useCallback(
    async (changes: UpdateProfileInput) => {
      if (!session) {
        return;
      }

      const user = await requestUpdateProfile(session.user, changes);
      await startSession({ ...session, user });
    },
    [session, startSession]
  );

  const signOut = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ isLoading, session, signIn, signOut, signUp, updateProfile }),
    [isLoading, session, signIn, signOut, signUp, updateProfile]
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
