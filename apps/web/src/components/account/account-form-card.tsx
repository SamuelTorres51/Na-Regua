import type { FormEvent, PropsWithChildren } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { PrimaryButton } from "@/components/ui/primary-button";

export interface AccountFeedback {
  message: string;
  type: "error" | "success";
}

interface AccountFormCardProps extends PropsWithChildren {
  feedback: AccountFeedback | null;
  isBusy: boolean;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitDisabled?: boolean;
  submitLabel: string;
  title: string;
}

export function AccountFormCard({
  children,
  feedback,
  isBusy,
  isSaving,
  onSubmit,
  submitDisabled = false,
  submitLabel,
  title,
}: AccountFormCardProps) {
  return (
    <section className="self-start rounded-3xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
      <h2 className="mb-5 font-roboto-semibold text-base text-white">
        {title}
      </h2>
      <form noValidate onSubmit={onSubmit}>
        <fieldset
          className="flex min-w-0 flex-col gap-4"
          disabled={isBusy || isSaving}
        >
          {children}
          {feedback?.type === "error" ? (
            <FormAlert message={feedback.message} />
          ) : null}
          {feedback?.type === "success" ? (
            <p
              className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 font-roboto text-emerald-300 text-sm"
              role="status"
            >
              {feedback.message}
            </p>
          ) : null}
          <div className="mt-1 sm:max-w-52">
            <PrimaryButton
              disabled={isBusy || submitDisabled}
              isLoading={isSaving}
              label={submitLabel}
              loadingLabel="Salvando..."
            />
          </div>
        </fieldset>
      </form>
    </section>
  );
}
