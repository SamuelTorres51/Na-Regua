import { useCallback, useState } from "react";

import { signIn } from "@/services/auth";
import { type LoginErrors, validateLogin } from "./validation";

const INVALID_CREDENTIALS_MESSAGE =
  "Não foi possível entrar. Confira seu e-mail e senha.";

export function useLoginForm() {
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
      // PROVISÓRIO: redirecionar para a área logada quando as rotas existirem.
    } catch {
      setSubmitError(INVALID_CREDENTIALS_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password]);

  const handleRecoverPassword = useCallback(() => {
    // PROVISÓRIO: abrir o fluxo de recuperação de senha.
  }, []);

  return {
    email,
    errors,
    handleRecoverPassword,
    handleSubmit,
    isSubmitting,
    password,
    setEmail,
    setPassword,
    submitError,
  };
}
