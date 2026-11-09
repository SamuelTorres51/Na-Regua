import { useCallback, useState } from "react";

import { isNetworkError } from "@/services/api-client";
import {
  InvalidCredentialsError,
  PanelAccessDeniedError,
} from "@/services/auth";
import { useSession } from "./session-provider";
import { type LoginErrors, validateLogin } from "./validation";

const signInErrorMessages = {
  accessDenied:
    "Acesso negado. O painel é restrito a administradores e profissionais; clientes devem usar o aplicativo Na Régua.",
  invalidCredentials: "E-mail ou senha incorretos.",
  network:
    "Não foi possível conectar ao servidor. Tente novamente em instantes.",
  unknown: "Não foi possível entrar. Tente novamente.",
} as const;

const SESSION_EXPIRED_MESSAGE = "Sua sessão expirou. Entre novamente.";

function describeSignInError(error: unknown) {
  if (error instanceof InvalidCredentialsError) {
    return signInErrorMessages.invalidCredentials;
  }

  if (error instanceof PanelAccessDeniedError) {
    return signInErrorMessages.accessDenied;
  }

  if (isNetworkError(error)) {
    return signInErrorMessages.network;
  }

  return signInErrorMessages.unknown;
}

export function useLoginForm() {
  const { hasSessionExpired, signIn } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn({ email: email.trim(), password });
    } catch (error) {
      setSubmitError(describeSignInError(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, signIn]);

  const handleRecoverPassword = useCallback(() => {
    // PROVISÓRIO: abrir o fluxo de recuperação de senha.
  }, []);

  const sessionNotice = hasSessionExpired ? SESSION_EXPIRED_MESSAGE : null;

  return {
    alertMessage: submitError ?? sessionNotice,
    email,
    errors,
    handleRecoverPassword,
    handleSubmit,
    isSubmitting,
    password,
    setEmail,
    setPassword,
  };
}
