import { useCallback, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Cliente } from "@/features/clients/types";
import { getApiErrorMessage } from "@/services/api-client";

interface ClientStatusDialogProps {
  cliente: Cliente;
  onChangeStatus: (id: number, ativo: boolean) => Promise<void>;
  onClose: () => void;
}

export function ClientStatusDialog({
  cliente,
  onChangeStatus,
  onClose,
}: ClientStatusDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef<boolean>(false);

  const { ativo, id, nome } = cliente;
  const action = ativo ? "Inativar" : "Reativar";

  const close = useCallback(() => {
    if (!isSubmitting.current) {
      onClose();
    }
  }, [onClose]);

  const confirm = useCallback(async () => {
    if (isSubmitting.current) {
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    setError(null);
    try {
      await onChangeStatus(id, !ativo);
      onClose();
    } catch (failure) {
      setError(
        getApiErrorMessage(
          failure,
          "Não foi possível alterar o status do cliente. Tente novamente."
        )
      );
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  }, [ativo, id, onClose, onChangeStatus]);

  return (
    <ConfirmDialog
      confirmLabel={action}
      description={
        ativo
          ? `${nome} perderá o acesso à conta e ficará indisponível para novos agendamentos. Você pode reativar o cadastro depois.`
          : `${nome} poderá acessar a conta e voltar a fazer agendamentos.`
      }
      error={error}
      isLoading={isLoading}
      isOpen
      onClose={close}
      onConfirm={confirm}
      title={`${action} cliente?`}
      tone={ativo ? "danger" : "primary"}
    />
  );
}
