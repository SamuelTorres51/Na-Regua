import type { AuthSession, User } from "@/types/models";
import { formatPhone, onlyDigits } from "@/utils/phone";
import { api, HTTP_STATUS, hasApiStatus, isApiEnabled } from "./api-client";
import { simulateLatency } from "./fake-api";

const MOCK_TOKEN = "mock-token";
const MOCK_USER_ID = "usr-1";
const STAFF_EMAILS = ["barbearia@naregua.com"];
const SESSION_CHECK_TIMEOUT_MS = 5000;
const CLIENT_ROLE = "cliente";

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

export class InvalidCredentialsError extends Error {
  constructor() {
    super("E-mail ou senha inválidos.");
    this.name = "InvalidCredentialsError";
  }
}

export class ClientAccessDeniedError extends Error {
  constructor() {
    super("A conta não é de cliente.");
    this.name = "ClientAccessDeniedError";
  }
}

interface UserResponse {
  email: string;
  id: number;
  nome: string;
  perfil: string;
  telefone: string;
}

interface AuthResponse {
  access_token: string;
  usuario: UserResponse;
}

function toUser({ email, id, nome, telefone }: UserResponse): User {
  return {
    email,
    fullName: nome,
    id: String(id),
    phone: formatPhone(telefone),
  };
}

function toSession({ access_token, usuario }: AuthResponse): AuthSession {
  return { token: access_token, user: toUser(usuario) };
}

function isClientAccount({ perfil }: UserResponse) {
  return perfil === CLIENT_ROLE;
}

function isStaffEmail(email: string) {
  return STAFF_EMAILS.includes(email.toLowerCase());
}

function rethrowEmailInUse(error: unknown): never {
  if (hasApiStatus(error, HTTP_STATUS.conflict)) {
    throw new EmailInUseError();
  }

  throw error;
}

function rethrowInvalidCredentials(error: unknown): never {
  if (hasApiStatus(error, HTTP_STATUS.unauthorized)) {
    throw new InvalidCredentialsError();
  }

  throw error;
}

function isEmailTaken(email: string, currentEmail = "") {
  return (
    email.toLowerCase() !== currentEmail.toLowerCase() && isStaffEmail(email)
  );
}

async function signInWithMock({ email }: SignInInput): Promise<AuthSession> {
  await simulateLatency();

  if (isStaffEmail(email)) {
    throw new InvalidCredentialsError();
  }

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

async function signUpWithMock({
  email,
  fullName,
  phone,
}: SignUpInput): Promise<AuthSession> {
  await simulateLatency();

  if (isEmailTaken(email)) {
    throw new EmailInUseError();
  }

  return {
    token: MOCK_TOKEN,
    user: { email, fullName, id: MOCK_USER_ID, phone },
  };
}

async function updateProfileWithMock(
  currentUser: User,
  changes: UpdateProfileInput
): Promise<User> {
  await simulateLatency();

  if (isEmailTaken(changes.email, currentUser.email)) {
    throw new EmailInUseError();
  }

  return { ...currentUser, ...changes };
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

  if (!isClientAccount(response.usuario)) {
    throw new InvalidCredentialsError();
  }

  return toSession(response);
}

async function signUpWithApi({
  email,
  fullName,
  password,
  phone,
}: SignUpInput): Promise<AuthSession> {
  try {
    const response = await api.post<AuthResponse>("/auth/register", {
      email,
      nome: fullName,
      senha: password,
      telefone: onlyDigits(phone),
    });

    return toSession(response);
  } catch (error) {
    return rethrowEmailInUse(error);
  }
}

async function updateProfileWithApi(
  _currentUser: User,
  { email, fullName, phone }: UpdateProfileInput
): Promise<User> {
  try {
    const response = await api.patch<UserResponse>("/auth/me", {
      email,
      nome: fullName,
      telefone: onlyDigits(phone),
    });

    return toUser(response);
  } catch (error) {
    return rethrowEmailInUse(error);
  }
}

export const signIn = isApiEnabled ? signInWithApi : signInWithMock;
export const signUp = isApiEnabled ? signUpWithApi : signUpWithMock;
export const updateProfile = isApiEnabled
  ? updateProfileWithApi
  : updateProfileWithMock;

export async function getCurrentUser() {
  const response = await api.get<UserResponse>("/auth/me", {
    timeoutMs: SESSION_CHECK_TIMEOUT_MS,
  });

  if (!isClientAccount(response)) {
    throw new ClientAccessDeniedError();
  }

  return toUser(response);
}
