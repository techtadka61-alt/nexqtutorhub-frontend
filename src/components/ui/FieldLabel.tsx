import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Red asterisk after a required field's label. */
export function RequiredMark() {
  return (
    <span className="text-error" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

/** Italic "(optional)" after an optional field's label. */
export function OptionalTag() {
  return <span className="ml-1 text-xs font-normal italic text-text-secondary">(optional)</span>;
}

/**
 * The one way field labels are written across the app: a required field ends in a red "*", an optional one in an
 * italic "(optional)". Filters and read-only fields pass neither.
 */
export function FieldLabel({
  children,
  required,
  optional,
  htmlFor,
  as: Tag = "label",
  className,
}: {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
  /** "legend" for a fieldset, "span"/"p" where a <label> would be wrong (e.g. a group of buttons). */
  as?: "label" | "legend" | "span" | "p";
  className?: string;
}) {
  return (
    <Tag {...(Tag === "label" && { htmlFor })} className={cn("text-sm font-medium text-text-primary", className)}>
      {children}
      {required ? <RequiredMark /> : optional ? <OptionalTag /> : null}
    </Tag>
  );
}
