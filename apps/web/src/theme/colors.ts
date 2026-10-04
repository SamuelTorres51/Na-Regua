/*
 * Paleta de cores compartilhada da Na Régua.
 * Mantida em sincronia com a aplicação mobile (apps/mobile/src/theme/colors.ts).
 */
export const colors = {
  accent: "#f59e0b",
  accentContrast: "#09090b",
  border: {
    error: "#f87171",
    focused: "#f59e0b",
    idle: "#3f3f46",
  },
  gradient: ["#27272a", "#111113", "#09090b"] as const,
  placeholder: "#52525b",
} as const;
