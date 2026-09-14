import { simulateLatency } from "./fake-api";

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
export async function signIn(_input: SignInInput) {
  await simulateLatency();
}

export async function signUp(_input: SignUpInput) {
  await simulateLatency();
}
