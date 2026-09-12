const FAKE_LATENCY_MS = 900;

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

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

// PROVISÓRIO: trocar pelas chamadas reais da API.
export async function signIn(_input: SignInInput) {
  await delay(FAKE_LATENCY_MS);
}

export async function signUp(_input: SignUpInput) {
  await delay(FAKE_LATENCY_MS);
}
