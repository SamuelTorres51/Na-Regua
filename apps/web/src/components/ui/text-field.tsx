import type { ChangeEvent, RefObject } from "react";
import { useCallback, useId, useState } from "react";

const BORDER_IDLE = "border-zinc-700";
const BORDER_FOCUSED = "border-brand";
const BORDER_ERROR = "border-danger";

function getBorderClass(hasError: boolean, isFocused: boolean) {
  if (hasError) {
    return BORDER_ERROR;
  }

  return isFocused ? BORDER_FOCUSED : BORDER_IDLE;
}

function getInputType(
  type: "email" | "password" | "text",
  isPasswordVisible: boolean
) {
  if (type !== "password") {
    return type;
  }

  return isPasswordVisible ? "text" : "password";
}

interface TextFieldProps {
  autoComplete: string;
  error?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "email" | "password" | "text";
  value: string;
}

export function TextField({
  autoComplete,
  error,
  inputRef,
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  const isPassword = type === "password";
  const borderClass = getBorderClass(Boolean(error), isFocused);

  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
    [onChange]
  );
  const handleToggleVisibility = useCallback(
    () => setIsPasswordVisible((current) => !current),
    []
  );

  return (
    <div className="flex flex-col">
      <label
        className="mb-2 font-roboto-medium text-sm text-zinc-400"
        htmlFor={fieldId}
      >
        {label}
      </label>

      <div
        className={`flex items-center rounded-2xl border bg-zinc-900/60 px-4 transition-colors duration-200 ${borderClass}`}
      >
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="h-14 flex-1 bg-transparent font-roboto text-base text-white outline-none placeholder:text-zinc-600"
          id={fieldId}
          name={name}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          ref={inputRef}
          type={getInputType(type, isPasswordVisible)}
          value={value}
        />

        {isPassword ? (
          <button
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={isPasswordVisible}
            className="ml-3 font-roboto-medium text-brand text-xs uppercase tracking-wide transition-opacity hover:opacity-80"
            onClick={handleToggleVisibility}
            type="button"
          >
            {isPasswordVisible ? "Ocultar" : "Mostrar"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          className="mt-2 animate-fade-in font-roboto text-danger text-xs"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
