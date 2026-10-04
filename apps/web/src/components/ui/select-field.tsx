import type { ChangeEvent } from "react";
import { useCallback, useId } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}

export function SelectField({
  label,
  onChange,
  options,
  value,
}: SelectFieldProps) {
  const selectId = useId();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value),
    [onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <label
        className="font-roboto-medium text-xs text-zinc-400"
        htmlFor={selectId}
      >
        {label}
      </label>
      <select
        className="h-11 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 font-roboto text-sm text-white outline-none transition-colors hover:border-zinc-600 focus:border-brand"
        id={selectId}
        onChange={handleChange}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
