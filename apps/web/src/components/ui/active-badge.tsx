interface ActiveBadgeProps {
  ativo: boolean;
}

export function ActiveBadge({ ativo }: ActiveBadgeProps) {
  return (
    <span
      className={
        ativo
          ? "w-fit whitespace-nowrap rounded-full bg-emerald-400/10 px-2.5 py-1 font-roboto-medium text-[11px] text-emerald-400"
          : "w-fit whitespace-nowrap rounded-full bg-zinc-800 px-2.5 py-1 font-roboto-medium text-[11px] text-zinc-400"
      }
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}
