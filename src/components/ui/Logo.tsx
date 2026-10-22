import Image from "next/image";
import Link from "next/link";
import logoHorizontal from "@/assets/images/logo-horizontal.png";
import logoHorizontalLight from "@/assets/images/logo-horizontal-light.png";
import logoStacked from "@/assets/images/logo-full.png";

interface LogoProps {
  /** `horizontal-light` is the wordmark recoloured for dark backgrounds (e.g. the footer). */
  variant?: "horizontal" | "horizontal-light" | "stacked";
  className?: string;
  href?: string | false;
  /**
   * Above-the-fold logo (the navbar): load straight away rather than lazily, but at low priority. React preloads
   * every non-lazy <img> from <head> unless fetchPriority is "low", which would make the logo compete with the
   * hero image (the LCP) for bandwidth.
   */
  eager?: boolean;
  /** Overrides the per-variant default below when a caller renders the logo at a known, different width. */
  sizes?: string;
}

const SOURCES = {
  horizontal: logoHorizontal,
  "horizontal-light": logoHorizontalLight,
  stacked: logoStacked,
};

/**
 * Largest rendered width per variant, so the browser picks a ~200–400px file instead of the 1779px source.
 * Horizontal: at most h-9 (36px) tall → ~196px wide. Stacked: at most h-16 (64px) tall → ~121px wide.
 */
const SIZES = {
  horizontal: "200px",
  "horizontal-light": "200px",
  stacked: "124px",
};

/** Brand mark. `href` renders it as a home link (default "/"); pass `href={false}` for a static logo. */
export function Logo({ variant = "horizontal", className, href = "/", eager, sizes }: LogoProps) {
  const image = (
    <Image
      src={SOURCES[variant]}
      alt="NexTutorHub"
      sizes={sizes ?? SIZES[variant]}
      loading={eager ? "eager" : undefined}
      fetchPriority={eager ? "low" : undefined}
      // A passed className replaces the default size (cn doesn't dedupe conflicting h-* classes).
      className={className ?? (variant === "stacked" ? "h-16 w-auto" : "h-9 w-auto")}
    />
  );

  if (href === false) return image;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="NexTutorHub home">
      {image}
    </Link>
  );
}
