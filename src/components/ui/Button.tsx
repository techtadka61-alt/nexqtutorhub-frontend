import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "outline-inverse" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-soft disabled:bg-brand-primary/50",
  secondary:
    "bg-brand-secondary text-white hover:bg-brand-primary shadow-soft disabled:bg-brand-secondary/50",
  outline:
    "border border-border bg-surface text-text-primary hover:border-brand-secondary hover:text-brand-secondary disabled:opacity-50",
  "outline-inverse":
    "border border-white/30 text-white hover:bg-white/10 disabled:opacity-50",
  ghost: "text-text-primary hover:bg-brand-secondary-light disabled:opacity-50",
  danger: "bg-error text-white hover:bg-error/90 disabled:bg-error/50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  /** Fully rounded (default) or a rectangle with softly rounded corners. */
  pill?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  "inline-flex items-center justify-center font-semibold transition-colors duration-150 focus-ring disabled:cursor-not-allowed select-none";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    pill = true,
    isLoading,
    leftIcon,
    rightIcon,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    baseClasses,
    pill ? "rounded-full" : "rounded-xl",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {isLoading ? <Spinner /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </>
  );

  if ("href" in props && props.href) {
    const { href, target, rel } = rest as ButtonAsLink;
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {content}
      </Link>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={ref} className={classes} disabled={isLoading || buttonRest.disabled} {...buttonRest}>
      {content}
    </button>
  );
});

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
