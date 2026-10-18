import { cn } from "@/lib/cn";
import { FieldLabel } from "@/components/ui/FieldLabel";

interface MultiSelectChipsProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  required?: boolean;
  optional?: boolean;
}

export function MultiSelectChips({ label, options, value, onChange, hint, required, optional }: MultiSelectChipsProps) {
  function toggle(option: string) {
    if (value.includes(option)) onChange(value.filter((v) => v !== option));
    else onChange([...value, option]);
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel as="span" required={required} optional={optional}>
        {label}
      </FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-brand-secondary bg-brand-secondary-light text-brand-primary"
                  : "border-border bg-surface text-text-secondary hover:border-brand-secondary/50",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {hint && <p className="text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}
