import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Show the label text as the placeholder instead of above the field (label stays for screen readers). */
  labelAsPlaceholder?: boolean;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, labelAsPlaceholder, error, hint, leftIcon, className, containerClassName, id, type, placeholder, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn("text-sm font-medium text-text-primary", labelAsPlaceholder && "sr-only")}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={cn(
            "h-13 w-full rounded-xl border bg-surface px-4 text-sm text-text-primary placeholder:text-text-secondary/70 transition-colors focus-ring",
            !!leftIcon && "pl-11",
            isPassword && "pr-11",
            error ? "border-error" : "border-border focus:border-brand-secondary",
            className,
          )}
          aria-invalid={!!error}
          placeholder={labelAsPlaceholder ? label : placeholder}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-brand-secondary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs font-medium text-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-secondary">{hint}</p>
      ) : null}
    </div>
  );
});

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.7 10.7 0 0112 5c6.5 0 10 7 10 7a17.7 17.7 0 01-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7a10 10 0 004.4-1" />
      <path d="M9.9 9.9a3 3 0 004.2 4.2" />
    </svg>
  );
}
