interface PrimaryButtonProps {
  isLoading?: boolean;
  label: string;
  type?: "button" | "submit";
}

export function PrimaryButton({
  isLoading = false,
  label,
  type = "submit",
}: PrimaryButtonProps) {
  return (
    <button
      aria-busy={isLoading}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-roboto font-semibold text-base text-zinc-950 transition duration-150 hover:brightness-110 focus-visible:outline-brand active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      type={type}
    >
      {isLoading ? (
        <>
          <svg
            aria-hidden="true"
            className="h-5 w-5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              fill="currentColor"
            />
          </svg>
          <span>Entrando...</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
