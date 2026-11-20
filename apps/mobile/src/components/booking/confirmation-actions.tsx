import { View } from "react-native";
import { FormAlert } from "@/components/feedback/form-alert";
import { PrimaryButton } from "@/components/ui/primary-button";
import type { ConfirmationError } from "@/features/booking/confirmation-errors";

interface ConfirmationActionsProps {
  confirmError: ConfirmationError | null;
  confirmLabel: string;
  isConfirming: boolean;
  onChooseAnotherTime: () => void;
  onConfirm: () => void;
}

export function ConfirmationActions({
  confirmError,
  confirmLabel,
  isConfirming,
  onChooseAnotherTime,
  onConfirm,
}: ConfirmationActionsProps) {
  const hasConflict = confirmError?.kind === "conflict";

  return (
    <View>
      <FormAlert message={confirmError?.message ?? null} />

      {hasConflict ? (
        <PrimaryButton
          accessibilityLabel="Escolher outro horário"
          label="Escolher outro horário"
          onPress={onChooseAnotherTime}
        />
      ) : (
        <PrimaryButton
          accessibilityLabel={confirmLabel}
          isLoading={isConfirming}
          label={confirmLabel}
          onPress={onConfirm}
        />
      )}
    </View>
  );
}
