const FAKE_LATENCY_MS = 900;

export interface SignInInput {
  email: string;
  password: string;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

// PROVISÓRIO: trocar pela chamada real da API quando a rota de autenticação
// estiver disponível. Mantido em sincronia com apps/mobile/src/services/auth.ts.
export async function signIn(_input: SignInInput) {
  await delay(FAKE_LATENCY_MS);
}
