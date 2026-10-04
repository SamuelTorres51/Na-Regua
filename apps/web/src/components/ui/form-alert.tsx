interface FormAlertProps {
  message: string;
}

export function FormAlert({ message }: FormAlertProps) {
  return (
    <div
      className="flex animate-fade-in items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3"
      role="alert"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger/20 font-roboto-bold text-danger text-xs"
      >
        !
      </span>
      <p className="font-roboto text-danger text-sm">{message}</p>
    </div>
  );
}
