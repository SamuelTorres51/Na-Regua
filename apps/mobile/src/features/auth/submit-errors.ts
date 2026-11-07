import { isNetworkError } from "@/services/api-client";
import { InvalidCredentialsError } from "@/services/auth";

export const submitErrorMessages = {
  invalidCredentials: "E-mail ou senha incorretos.",
  network:
    "Sem conexão com o servidor. Verifique sua internet e tente novamente.",
  signIn: "Não foi possível entrar. Tente novamente.",
  signUp: "Não foi possível criar sua conta. Tente novamente.",
  updateProfile: "Não foi possível salvar seus dados. Tente novamente.",
} as const;

export function describeSubmitError(error: unknown, fallbackMessage: string) {
  if (error instanceof InvalidCredentialsError) {
    return submitErrorMessages.invalidCredentials;
  }

  if (isNetworkError(error)) {
    return submitErrorMessages.network;
  }

  return fallbackMessage;
}
