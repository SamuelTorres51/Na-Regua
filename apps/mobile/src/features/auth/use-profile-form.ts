import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { useToast } from "@/components/feedback/toast-provider";
import { useDiscardChangesGuard } from "@/hooks/use-discard-changes-guard";
import { EmailInUseError } from "@/services/auth";
import type { User } from "@/types/models";
import { formatPhone } from "@/utils/phone";
import { useSession } from "./session-provider";
import {
  type ProfileErrors,
  type ProfileValues,
  validateProfile,
  validationMessages,
} from "./validation";

const UPDATE_SUCCESS_MESSAGE = "Dados atualizados.";
const UPDATE_ERROR_MESSAGE =
  "Não foi possível salvar seus dados. Tente novamente.";

const EMPTY_PROFILE: ProfileValues = { email: "", fullName: "", phone: "" };

function toProfileValues(user: User | undefined): ProfileValues {
  if (!user) {
    return EMPTY_PROFILE;
  }

  return {
    email: user.email,
    fullName: user.fullName,
    phone: formatPhone(user.phone),
  };
}

export function useProfileForm() {
  const router = useRouter();
  const { session, updateProfile } = useSession();
  const { showToast } = useToast();

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const savedValues = toProfileValues(session?.user);
  const [fullName, setFullName] = useState(savedValues.fullName);
  const [email, setEmail] = useState(savedValues.email);
  const [phone, setPhone] = useState(savedValues.phone);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges =
    fullName.trim() !== savedValues.fullName ||
    email.trim() !== savedValues.email ||
    phone !== savedValues.phone;

  const {
    allowLeave,
    handleCancelDiscard,
    handleConfirmDiscard,
    isDialogVisible: isDiscardDialogVisible,
  } = useDiscardChangesGuard({ hasChanges, isBusy: isSubmitting });

  const handleChangePhone = useCallback(
    (value: string) => setPhone(formatPhone(value)),
    []
  );

  const handleFocusEmail = useCallback(() => emailRef.current?.focus(), []);
  const handleFocusPhone = useCallback(() => phoneRef.current?.focus(), []);

  const handleSubmit = useCallback(async () => {
    const values = { email: email.trim(), fullName: fullName.trim(), phone };
    const nextErrors = validateProfile(values);

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      setShakeTrigger((current) => current + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile(values);
      allowLeave();
      showToast({ message: UPDATE_SUCCESS_MESSAGE, tone: "success" });
      router.back();
    } catch (error) {
      if (error instanceof EmailInUseError) {
        setErrors({ email: validationMessages.emailInUse });
        setShakeTrigger((current) => current + 1);
      } else {
        setSubmitError(UPDATE_ERROR_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [allowLeave, email, fullName, phone, router, showToast, updateProfile]);

  return {
    email,
    emailRef,
    errors,
    fullName,
    handleCancelDiscard,
    handleChangePhone,
    handleConfirmDiscard,
    handleFocusEmail,
    handleFocusPhone,
    handleSubmit,
    hasChanges,
    isDiscardDialogVisible,
    isSubmitting,
    phone,
    phoneRef,
    setEmail,
    setFullName,
    shakeTrigger,
    submitError,
  };
}
