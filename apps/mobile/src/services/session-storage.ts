import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import type { AuthSession } from "@/types/models";

const SESSION_KEY = "naregua.session";

export async function loadSession(): Promise<AuthSession | null> {
  const stored = await getItemAsync(SESSION_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    await deleteItemAsync(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession) {
  return setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  return deleteItemAsync(SESSION_KEY);
}
