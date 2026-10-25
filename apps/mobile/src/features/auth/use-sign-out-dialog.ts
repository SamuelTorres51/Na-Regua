import { useCallback, useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import { useSession } from "./session-provider";

const SIGN_OUT_ERROR_MESSAGE = "Não foi possível sair. Tente novamente.";

export function useSignOutDialog() {
  const { signOut } = useSession();
  const { showToast } = useToast();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleRequestSignOut = useCallback(() => {
    setIsDialogVisible(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogVisible(false);
  }, []);

  const handleConfirmSignOut = useCallback(async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch {
      showToast({ message: SIGN_OUT_ERROR_MESSAGE, tone: "error" });
    } finally {
      setIsSigningOut(false);
      setIsDialogVisible(false);
    }
  }, [showToast, signOut]);

  return {
    handleCloseDialog,
    handleConfirmSignOut,
    handleRequestSignOut,
    isDialogVisible,
    isSigningOut,
  };
}
