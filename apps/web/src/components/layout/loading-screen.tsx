import { SpinnerIcon } from "@/components/ui/icons";
import { GradientBackground } from "./gradient-background";

interface LoadingScreenProps {
  label: string;
}

export function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <GradientBackground>
      <div
        aria-live="polite"
        className="flex flex-1 items-center justify-center gap-3 text-zinc-400"
        role="status"
      >
        <SpinnerIcon className="h-5 w-5 animate-spin text-brand" />
        <span className="font-roboto text-sm">{label}</span>
      </div>
    </GradientBackground>
  );
}
