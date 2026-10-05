import type { AuthSession } from "@/types/models";
import { simulateLatency } from "./fake-api";

const MOCK_TOKEN = "mock-token";
const MOCK_USER_ID = "usr-1";

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  fullName: string;
  password: string;
  phone: string;
}

// PROVISÓRIO: trocar pelas chamadas reais da API.
export async function signIn({ email }: SignInInput): Promise<AuthSession> {
  await simulateLatency();

  return {
    token: MOCK_TOKEN,
    user: {
      email,
      fullName: "Dagoberto",
      id: MOCK_USER_ID,
      phone: "(89) 99999-9999",
    },
  };
}

export async function signUp({
  email,
  fullName,
  phone,
}: SignUpInput): Promise<AuthSession> {
  await simulateLatency();

  return {
    token: MOCK_TOKEN,
    user: { email, fullName, id: MOCK_USER_ID, phone },
  };
}
