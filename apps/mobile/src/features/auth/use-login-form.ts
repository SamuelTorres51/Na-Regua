import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { useAsyncAction } from "@/hooks/use-async-action";
import { signIn } from "@/services/auth";
import { type LoginErrors, validateLogin } from "./validation";

export function useLoginForm() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const handleSuccess = useCallback(() => {
    // PROVISÓRIO: apontar para a área logada quando ela existir.
    router.replace("/");
  }, [router]);

  const { isRunning: isSubmitting, run } = useAsyncAction(signIn, {
    onSuccess: handleSuccess,
  });

  const handleFocusPassword = useCallback(
    () => passwordRef.current?.focus(),
    []
  );

  const handleSubmit = useCallback(() => {
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setShakeTrigger((current) => current + 1);
      return;
    }

    run({ email: email.trim(), password });
  }, [email, password, run]);

  return {
    email,
    errors,
    handleFocusPassword,
    handleSubmit,
    isSubmitting,
    password,
    passwordRef,
    setEmail,
    setPassword,
    shakeTrigger,
  };
}
