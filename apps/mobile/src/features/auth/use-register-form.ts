import { useCallback, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { useAsyncAction } from "@/hooks/use-async-action";
import { formatPhone } from "@/utils/phone";
import { useSession } from "./session-provider";
import { type RegisterErrors, validateRegister } from "./validation";

export function useRegisterForm() {
  const { signUp } = useSession();

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const { isRunning: isSubmitting, run } = useAsyncAction(signUp);

  const handleChangePhone = useCallback(
    (value: string) => setPhone(formatPhone(value)),
    []
  );

  const handleToggleTerms = useCallback(
    () => setHasAcceptedTerms((current) => !current),
    []
  );

  const handleFocusEmail = useCallback(() => emailRef.current?.focus(), []);
  const handleFocusPhone = useCallback(() => phoneRef.current?.focus(), []);
  const handleFocusPassword = useCallback(
    () => passwordRef.current?.focus(),
    []
  );
  const handleFocusConfirmPassword = useCallback(
    () => confirmPasswordRef.current?.focus(),
    []
  );

  const handleSubmit = useCallback(() => {
    const nextErrors = validateRegister({
      confirmPassword,
      email,
      fullName,
      hasAcceptedTerms,
      password,
      phone,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setShakeTrigger((current) => current + 1);
      return;
    }

    run({
      email: email.trim(),
      fullName: fullName.trim(),
      password,
      phone,
    });
  }, [
    confirmPassword,
    email,
    fullName,
    hasAcceptedTerms,
    password,
    phone,
    run,
  ]);

  return {
    confirmPassword,
    confirmPasswordRef,
    email,
    emailRef,
    errors,
    fullName,
    handleChangePhone,
    handleFocusConfirmPassword,
    handleFocusEmail,
    handleFocusPassword,
    handleFocusPhone,
    handleSubmit,
    handleToggleTerms,
    hasAcceptedTerms,
    isSubmitting,
    password,
    passwordRef,
    phone,
    phoneRef,
    setConfirmPassword,
    setEmail,
    setFullName,
    setPassword,
    shakeTrigger,
  };
}
