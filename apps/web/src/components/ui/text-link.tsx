interface TextLinkProps {
  label: string;
  onClick: () => void;
}

export function TextLink({ label, onClick }: TextLinkProps) {
  return (
    <button
      className="font-roboto font-semibold text-brand text-sm transition-opacity hover:opacity-80"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
