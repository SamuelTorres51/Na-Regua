export const colors = {
  accent: "#f59e0b",
  accentContrast: "#09090b",
  background: "#09090b",
  border: {
    error: "#f87171",
    focused: "#f59e0b",
    idle: "#3f3f46",
  },
  gradient: ["#27272a", "#111113", "#09090b"] as const,
  icon: {
    active: "#f59e0b",
    default: "#fafafa",
    muted: "#71717a",
  },
  placeholder: "#52525b",
  status: {
    cancelled: "#f87171",
    completed: "#4ade80",
    confirmed: "#f59e0b",
    inProgress: "#38bdf8",
    noShow: "#a1a1aa",
    scheduled: "#e4e4e7",
  },
  strength: ["#3f3f46", "#f87171", "#fbbf24", "#a3e635", "#4ade80"] as const,
  surface: {
    card: "#18181b",
    elevated: "#27272a",
  },
} as const;
