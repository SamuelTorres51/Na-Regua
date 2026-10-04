import type { PropsWithChildren } from "react";

import { colors } from "@/theme/colors";

export function GradientBackground({ children }: PropsWithChildren) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${colors.gradient.join(", ")})`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: colors.accent }}
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
