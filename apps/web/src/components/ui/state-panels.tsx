import { SpinnerIcon } from "./icons";

interface LoadingPanelProps {
  label: string;
}

export function LoadingPanel({ label }: LoadingPanelProps) {
  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/30 py-16 text-zinc-400"
      role="status"
    >
      <SpinnerIcon className="h-5 w-5 animate-spin" />
      <span className="font-roboto text-sm">{label}</span>
    </div>
  );
}

interface ErrorPanelProps {
  message: string;
}

export function ErrorPanel({ message }: ErrorPanelProps) {
  return (
    <div
      className="rounded-3xl border border-danger/40 bg-danger/10 px-6 py-10 text-center"
      role="alert"
    >
      <p className="font-roboto-medium text-danger text-sm">{message}</p>
    </div>
  );
}
