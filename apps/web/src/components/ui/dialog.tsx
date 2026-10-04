import type { PropsWithChildren } from "react";
import { useEffect, useId } from "react";

import { CloseIcon } from "./icons";

interface DialogProps {
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Dialog({
  children,
  description,
  isOpen,
  onClose,
  title,
}: PropsWithChildren<DialogProps>) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Fechar"
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 max-h-[90dvh] w-full max-w-lg animate-fade-in-up overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/60 sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-roboto-bold text-white text-xl" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="mt-1 font-roboto text-sm text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>

          <button
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
