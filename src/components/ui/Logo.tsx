import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import logoHorizontal from "@/assets/images/logo-horizontal.png";
import logoHorizontalLight from "@/assets/images/logo-horizontal-light.png";
import logoStacked from "@/assets/images/logo-full.png";

interface LogoProps {
  /** `horizontal-light` is the wordmark recoloured for dark backgrounds (e.g. the footer). */
  variant?: "horizontal" | "horizontal-light" | "stacked";
  className?: string;
  href?: string | false;
  priority?: boolean;
}

const SOURCES = {
  horizontal: logoHorizontal,
  "horizontal-light": logoHorizontalLight,
  stacked: logoStacked,
};

/** Brand mark. `href` renders it as a home link (default "/"); pass `href={false}` for a static logo. */
export function Logo({ variant = "horizontal", className, href = "/", priority }: LogoProps) {
  const image = (
    <Image
      src={SOURCES[variant]}
      alt="NexTutorHub"
      priority={priority}
      className={cn(variant === "stacked" ? "h-16 w-auto" : "h-9 w-auto", className)}
    />
  );

  if (href === false) return image;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="NexTutorHub home">
      {image}
    </Link>
  );
}
