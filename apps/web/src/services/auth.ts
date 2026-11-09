import { canAccessPanel } from "@/features/auth/permissions";
import type { AuthSession, Usuario } from "@/features/auth/types";
import { api, HTTP_STATUS, hasApiStatus, isApiEnabled } from "./api-client";

const FAKE_LATENCY_MS = 900;
const SESSION_CHECK_TIMEOUT_MS = 5000;
const MOCK_TOKEN = "mock-token";

export interface SignInInput {
  email: string;
  password: string;
}

export class InvalidCredentialsError extends Error {
  constructor(options?: ErrorOptions) {
    super("E-mail ou senha inválidos.", options);
    this.name = "InvalidCredentialsError";
  }
}

export class PanelAccessDeniedError extends Error {
  constructor() {
    super("A conta não tem acesso ao painel.");
    this.name = "PanelAccessDeniedError";
  }
}

function ensurePanelAccess(usuario: Usuario) {
  if (!canAccessPanel(usuario.perfil)) {
    throw new PanelAccessDeniedError();
  }

  return usuario;
}

interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

// PROVISÓRIO: usado enquanto VITE_API_URL não estiver configurada.
async function signInWithMock({ email }: SignInInput): Promise<AuthSession> {
  await delay(FAKE_LATENCY_MS);

  return {
    token: MOCK_TOKEN,
    usuario: {
      ativo: true,
      email,
      id: 1,
      nome: "Administrador",
      perfil: "administrador",
      telefone: "",
    },
  };
}

function rethrowInvalidCredentials(error: unknown): never {
  if (hasApiStatus(error, HTTP_STATUS.unauthorized)) {
    throw new InvalidCredentialsError({ cause: error });
  }

  throw error;
}

async function requestSignIn(email: string, password: string) {
  try {
    return await api.post<AuthResponse>("/auth/login", {
      email,
      senha: password,
    });
  } catch (error) {
    return rethrowInvalidCredentials(error);
  }
}

async function signInWithApi({
  email,
  password,
}: SignInInput): Promise<AuthSession> {
  const response = await requestSignIn(email, password);

  return {
    token: response.access_token,
    usuario: ensurePanelAccess(response.usuario),
  };
}

export const signIn = isApiEnabled ? signInWithApi : signInWithMock;

export async function getCurrentUser() {
  const usuario = await api.get<Usuario>("/auth/me", {
    timeoutMs: SESSION_CHECK_TIMEOUT_MS,
  });

  return ensurePanelAccess(usuario);
}
