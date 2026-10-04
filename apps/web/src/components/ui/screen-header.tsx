interface ScreenHeaderProps {
  subtitle: string;
  title: string;
}

export function ScreenHeader({ subtitle, title }: ScreenHeaderProps) {
  return (
    <header className="animate-fade-in-down">
      <span
        aria-hidden="true"
        className="block h-1 w-12 rounded-full bg-brand"
      />
      <h1 className="mt-6 font-roboto-bold text-4xl text-white leading-[1.1]">
        {title}
      </h1>
      <p className="mt-3 font-roboto text-base text-zinc-400">{subtitle}</p>
    </header>
  );
}
