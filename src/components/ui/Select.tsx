import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/ui/FieldLabel";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  /** Show the label text as the empty-state option instead of above the field (label stays for screen readers). */
  labelAsPlaceholder?: boolean;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  /** Marks the label "(optional)". Required fields are marked from `required`. */
  optional?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, labelAsPlaceholder, error, hint, options, placeholder: placeholderProp, className, containerClassName, id, optional, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const placeholder = labelAsPlaceholder ? label : placeholderProp;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <FieldLabel htmlFor={selectId} required={rest.required} optional={optional} className={cn(labelAsPlaceholder && "sr-only")}>
          {label}
        </FieldLabel>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-13 w-full rounded-xl border bg-surface px-4 text-sm text-text-primary transition-colors focus-ring invalid:text-text-secondary/70",
            error ? "border-error" : "border-border focus:border-brand-secondary",
            className,
          )}
          aria-invalid={!!error}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="text-xs font-medium text-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-secondary">{hint}</p>
      ) : null}
    </div>
  );
});
