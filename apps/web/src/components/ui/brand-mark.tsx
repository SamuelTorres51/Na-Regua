interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-brand" />
      <span className="font-roboto-bold text-white text-xl tracking-tight">
        Na Régua
      </span>
    </div>
  );
}
