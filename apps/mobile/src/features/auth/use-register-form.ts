import { useCallback, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { useToast } from "@/components/feedback/toast-provider";
import { useAsyncAction } from "@/hooks/use-async-action";
import { EmailInUseError } from "@/services/auth";
import { formatPhone } from "@/utils/phone";
import { useSession } from "./session-provider";
import { describeSubmitError, submitErrorMessages } from "./submit-errors";
import {
  type RegisterErrors,
  validateRegister,
  validationMessages,
} from "./validation";

const SIGN_UP_SUCCESS_MESSAGE = "Conta criada. Boas-vindas ao Na Régua!";

export function useRegisterForm() {
  const { signUp } = useSession();
  const { showToast } = useToast();

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

  const handleSignUpSuccess = useCallback(
    () => showToast({ message: SIGN_UP_SUCCESS_MESSAGE, tone: "success" }),
    [showToast]
  );

  const handleSignUpError = useCallback((cause: Error) => {
    if (cause instanceof EmailInUseError) {
      setErrors({ email: validationMessages.emailInUse });
      setShakeTrigger((current) => current + 1);
    }
  }, []);

  const {
    error,
    isRunning: isSubmitting,
    run,
  } = useAsyncAction(signUp, {
    onError: handleSignUpError,
    onSuccess: handleSignUpSuccess,
  });

  const submitError =
    error && !(error instanceof EmailInUseError)
      ? describeSubmitError(error, submitErrorMessages.signUp)
      : null;

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
    submitError,
  };
}
