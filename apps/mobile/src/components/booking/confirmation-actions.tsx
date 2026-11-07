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
  onGoToAppointments: () => void;
}

interface ConfirmationButtonProps
  extends Omit<ConfirmationActionsProps, "confirmError"> {
  errorKind?: ConfirmationError["kind"];
}

function ConfirmationButton({
  confirmLabel,
  errorKind,
  isConfirming,
  onChooseAnotherTime,
  onConfirm,
  onGoToAppointments,
}: ConfirmationButtonProps) {
  if (errorKind === "conflict") {
    return (
      <PrimaryButton
        accessibilityLabel="Escolher outro horário"
        label="Escolher outro horário"
        onPress={onChooseAnotherTime}
      />
    );
  }

  if (errorKind === "notAllowed") {
    return (
      <PrimaryButton
        accessibilityLabel="Ver meus agendamentos"
        label="Ver meus agendamentos"
        onPress={onGoToAppointments}
      />
    );
  }

  return (
    <PrimaryButton
      accessibilityLabel={confirmLabel}
      isLoading={isConfirming}
      label={confirmLabel}
      onPress={onConfirm}
    />
  );
}

export function ConfirmationActions({
  confirmError,
  ...buttonProps
}: ConfirmationActionsProps) {
  return (
    <View>
      <FormAlert message={confirmError?.message ?? null} />
      <ConfirmationButton {...buttonProps} errorKind={confirmError?.kind} />
    </View>
  );
}
