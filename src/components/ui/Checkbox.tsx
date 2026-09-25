import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-2.5 text-sm text-text-secondary">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 rounded border-border text-brand-secondary accent-brand-secondary focus-ring",
            className,
          )}
          {...rest}
        />
        {label && <span>{label}</span>}
      </label>
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
});
