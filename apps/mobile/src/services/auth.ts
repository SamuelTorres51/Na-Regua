import type { AuthSession, User } from "@/types/models";
import { formatPhone, onlyDigits } from "@/utils/phone";
import { api, HTTP_STATUS, hasApiStatus } from "./api-client";

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

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
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

export class IncorrectPasswordError extends Error {
  constructor() {
    super("A senha atual está incorreta.");
    this.name = "IncorrectPasswordError";
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

function rethrowIncorrectPassword(error: unknown): never {
  if (hasApiStatus(error, HTTP_STATUS.badRequest)) {
    throw new IncorrectPasswordError();
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

export async function signIn({
  email,
  password,
}: SignInInput): Promise<AuthSession> {
  const response = await requestSignIn(email, password);

  if (!isClientAccount(response.usuario)) {
    throw new InvalidCredentialsError();
  }

  return toSession(response);
}

export async function signUp({
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

export async function updateProfile({
  email,
  fullName,
  phone,
}: UpdateProfileInput): Promise<User> {
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

export async function changePassword({
  currentPassword,
  newPassword,
}: ChangePasswordInput) {
  try {
    await api.put("/auth/alterar-senha", {
      nova_senha: newPassword,
      senha_atual: currentPassword,
    });
  } catch (error) {
    rethrowIncorrectPassword(error);
  }
}

export async function getCurrentUser() {
  const response = await api.get<UserResponse>("/auth/me", {
    timeoutMs: SESSION_CHECK_TIMEOUT_MS,
  });

  if (!isClientAccount(response)) {
    throw new ClientAccessDeniedError();
  }

  return toUser(response);
}
