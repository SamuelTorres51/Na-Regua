import type { AuthSession, User } from "@/types/models";
import { simulateLatency } from "./fake-api";

const MOCK_TOKEN = "mock-token";
const MOCK_USER_ID = "usr-1";
const TAKEN_EMAILS = ["barbearia@naregua.com"];

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
      fullName: "Dagoberto Silva",
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

export interface UpdateProfileInput {
  email: string;
  fullName: string;
  phone: string;
}

export class EmailInUseError extends Error {
  constructor() {
    super("E-mail já cadastrado.");
    this.name = "EmailInUseError";
  }
}

export async function updateProfile(
  currentUser: User,
  changes: UpdateProfileInput
): Promise<User> {
  await simulateLatency();

  const email = changes.email.toLowerCase();
  const isEmailTaken =
    email !== currentUser.email.toLowerCase() && TAKEN_EMAILS.includes(email);

  if (isEmailTaken) {
    throw new EmailInUseError();
  }

  return { ...currentUser, ...changes };
}
