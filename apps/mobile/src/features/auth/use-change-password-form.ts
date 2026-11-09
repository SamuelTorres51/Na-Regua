import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { useToast } from "@/components/feedback/toast-provider";
import { useDiscardChangesGuard } from "@/hooks/use-discard-changes-guard";
import { changePassword, IncorrectPasswordError } from "@/services/auth";
import { describeSubmitError, submitErrorMessages } from "./submit-errors";
import {
  type PasswordChangeErrors,
  validatePasswordChange,
  validationMessages,
} from "./validation";

const CHANGE_SUCCESS_MESSAGE = "Senha alterada.";

export function useChangePasswordForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<PasswordChangeErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges =
    currentPassword.length > 0 ||
    newPassword.length > 0 ||
    confirmPassword.length > 0;

  const {
    allowLeave,
    handleCancelDiscard,
    handleConfirmDiscard,
    isDialogVisible: isDiscardDialogVisible,
  } = useDiscardChangesGuard({ hasChanges, isBusy: isSubmitting });

  const handleFocusNewPassword = useCallback(
    () => newPasswordRef.current?.focus(),
    []
  );
  const handleFocusConfirmPassword = useCallback(
    () => confirmPasswordRef.current?.focus(),
    []
  );

  const handleSubmit = useCallback(async () => {
    const nextErrors = validatePasswordChange({
      confirmPassword,
      currentPassword,
      newPassword,
    });

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      setShakeTrigger((current) => current + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword });
      allowLeave();
      showToast({ message: CHANGE_SUCCESS_MESSAGE, tone: "success" });
      router.back();
    } catch (error) {
      if (error instanceof IncorrectPasswordError) {
        setErrors({
          currentPassword: validationMessages.currentPasswordIncorrect,
        });
        setShakeTrigger((current) => current + 1);
      } else {
        setSubmitError(
          describeSubmitError(error, submitErrorMessages.changePassword)
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    allowLeave,
    confirmPassword,
    currentPassword,
    newPassword,
    router,
    showToast,
  ]);

  return {
    confirmPassword,
    confirmPasswordRef,
    currentPassword,
    errors,
    handleCancelDiscard,
    handleConfirmDiscard,
    handleFocusConfirmPassword,
    handleFocusNewPassword,
    handleSubmit,
    hasChanges,
    isDiscardDialogVisible,
    isSubmitting,
    newPassword,
    newPasswordRef,
    setConfirmPassword,
    setCurrentPassword,
    setNewPassword,
    shakeTrigger,
    submitError,
  };
}
