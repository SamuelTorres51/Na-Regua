import { Dialog } from "./dialog";
import { FormAlert } from "./form-alert";
import { SpinnerIcon } from "./icons";

interface ConfirmDialogProps {
  confirmLabel: string;
  description: string;
  error: string | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmDialog({
  confirmLabel,
  description,
  error,
  isLoading,
  isOpen,
  onClose,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  return (
    <Dialog
      description={description}
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="flex flex-col gap-4">
        {error ? <FormAlert message={error} /> : null}

        <div className="flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-zinc-700 px-4 font-roboto-medium text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            aria-busy={isLoading}
            className="flex h-11 items-center gap-2 rounded-xl bg-danger px-5 font-roboto-semibold text-sm text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
          >
            {isLoading ? (
              <SpinnerIcon className="h-4 w-4 animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
