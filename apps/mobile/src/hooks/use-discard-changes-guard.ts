import { useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

interface DiscardChangesGuardOptions {
  hasChanges: boolean;
  isBusy: boolean;
}

export function useDiscardChangesGuard({
  hasChanges,
  isBusy,
}: DiscardChangesGuardOptions) {
  const navigation = useNavigation();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const leaveRef = useRef<(() => void) | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (isBusy) {
        event.preventDefault();
        return;
      }

      if (!hasChanges) {
        return;
      }

      event.preventDefault();
      leaveRef.current = () => navigation.dispatch(event.data.action);
      setIsDialogVisible(true);
    });

    unsubscribeRef.current = unsubscribe;

    return unsubscribe;
  }, [hasChanges, isBusy, navigation]);

  const allowLeave = useCallback(() => {
    unsubscribeRef.current?.();
  }, []);

  const handleCancelDiscard = useCallback(() => {
    setIsDialogVisible(false);
  }, []);

  const handleConfirmDiscard = useCallback(() => {
    setIsDialogVisible(false);
    unsubscribeRef.current?.();
    leaveRef.current?.();
  }, []);

  return {
    allowLeave,
    handleCancelDiscard,
    handleConfirmDiscard,
    isDialogVisible,
  };
}
