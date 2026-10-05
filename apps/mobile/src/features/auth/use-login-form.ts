import { useCallback, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { useSession } from "@/features/auth/session-provider";
import { type LoginErrors, validateLogin } from "@/features/auth/validation";
import { useAsyncAction } from "@/hooks/use-async-action";

export function useLoginForm() {
  const { signIn } = useSession();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const { isRunning: isSubmitting, run } = useAsyncAction(signIn);

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
