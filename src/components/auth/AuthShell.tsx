import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import illustration from "@/assets/images/login-illustration.png";
import { cn } from "@/lib/cn";

// Height left for the auth screen under the top bar (h-10) and navbar (h-20).
const SHELL_HEIGHT = "calc(100vh - 7.5rem)";

// The illustration is 1024x1536 (2:3), shown 25% larger than full height so it reads wider; that
// trims only empty background at the top and plain dark wave at the bottom.
const ILLUSTRATION_WIDTH = `calc(${SHELL_HEIGHT} * 5 / 6)`;

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-brand-secondary-light/70 via-bg to-surface"
      style={{ minHeight: SHELL_HEIGHT }}
    >
      <Backdrop />

      <div
        className="absolute inset-y-0 left-0 hidden overflow-hidden lg:block"
        style={{ width: ILLUSTRATION_WIDTH, maskImage: "linear-gradient(to right, black 80%, transparent)" }}
      >
        <Image
          src={illustration}
          alt="A tutor teaching online and a mother helping her son study at home"
          fill
          priority
          sizes="84vh"
          className="object-cover object-center"
        />
      </div>

      <div
        className="relative z-10 flex items-center justify-center px-4 py-8 lg:justify-end lg:py-[4vh] lg:pr-[3vw]"
        style={{ minHeight: SHELL_HEIGHT }}
      >
        <div className="flex w-full max-w-[480px] flex-col justify-center rounded-3xl border border-border/70 bg-surface px-6 py-10 shadow-lifted sm:px-10 lg:w-[clamp(420px,36vw,600px)] lg:max-w-none lg:px-[clamp(28px,3.5vw,64px)] lg:py-[clamp(24px,4vh,48px)]">
          <div className="mx-auto w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Plain, image-free layout for the longer signup forms. */
export function SignupShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-secondary-light/70 via-bg to-surface px-4 py-10 sm:py-14">
      <SignupBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-[680px] rounded-3xl border border-border/70 bg-surface px-6 py-8 shadow-lifted sm:px-10 sm:py-10">
        {children}
      </div>
    </div>
  );
}

/** Decorative layer that extends the illustration's style into the space between it and the card. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      <svg
        className="absolute top-[8%] h-[70%] text-brand-secondary-light"
        style={{ left: `calc(${ILLUSTRATION_WIDTH} * 0.55)`, width: "38vw" }}
        viewBox="0 0 400 500"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          opacity="0.75"
          d="M40 60C120-10 300 10 360 110s20 210-40 280-190 120-260 70S-10 330 10 230 -30 120 40 60Z"
        />
      </svg>

      <svg
        className="absolute top-[18%] h-[62%] text-brand-secondary"
        style={{ left: `calc(${ILLUSTRATION_WIDTH} * 0.82)`, width: "22vw" }}
        viewBox="0 0 300 500"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M10 470C70 420 40 330 120 290s150-40 140-140S160 40 230 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="8 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.7"
        />
      </svg>
      <Pin className="top-[42%] h-9 w-9" style={{ left: `calc(${ILLUSTRATION_WIDTH} * 0.98)` }} />
      <Pin className="top-[14%] h-7 w-7 opacity-80" style={{ left: `calc(${ILLUSTRATION_WIDTH} * 1.18)` }} />

      <Chip
        className="top-[26%]"
        style={{ left: `calc(${ILLUSTRATION_WIDTH} * 0.9)` }}
        icon={<ShieldIcon />}
        title="Verified tutors"
        subtitle="ID & qualification checked"
      />
      <Chip
        className="top-[62%]"
        style={{ left: `calc(${ILLUSTRATION_WIDTH} * 1.02)` }}
        icon={<PinIcon />}
        title="Tutors near you"
        subtitle="Home & online tuition"
      />

      <svg className="absolute inset-x-0 bottom-0 h-[20vh] w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="auth-wave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-brand-primary)" />
            <stop offset="0.45" stopColor="var(--color-brand-primary)" />
            <stop offset="0.75" stopColor="var(--color-brand-secondary)" stopOpacity="0.85" />
            <stop offset="1" stopColor="var(--color-brand-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path fill="url(#auth-wave)" d="M0 120C240 60 420 170 700 130s520-110 740-40V200H0Z" />
      </svg>
    </div>
  );
}

/**
 * Canva-style decoration for the image-free signup pages: soft blobs, dot grids, a dashed route
 * with map pins, floating study icons and trust chips. Side pieces only show where there is room
 * beside the centred 680px card.
 */
function SignupBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Soft blobs, visible at every size and sitting behind the card */}
      <svg className="absolute -top-28 -left-28 w-[460px] text-brand-secondary-light" viewBox="0 0 400 400">
        <path
          fill="currentColor"
          d="M318 64c44 38 64 104 44 160s-78 98-140 112-128-2-164-50S18 164 52 106 150 18 212 16s62 10 106 48Z"
        />
      </svg>
      <svg className="absolute -right-32 -bottom-32 w-[520px] text-brand-accent/35" viewBox="0 0 400 400">
        <path
          fill="currentColor"
          d="M330 90c40 46 52 118 22 172s-104 90-170 88S58 312 30 256s-20-128 20-176S150 8 214 14s76 30 116 76Z"
        />
      </svg>
      <div className="absolute top-[12%] right-[6%] hidden h-44 w-44 rounded-full border-2 border-dashed border-brand-accent md:block" />

      <DotGrid className="top-[6%] right-[16%] hidden text-brand-secondary/35 md:block" />
      <DotGrid className="bottom-[16%] left-[5%] hidden text-brand-secondary/35 md:block" />

      {/* Dashed "route" between two pins down the left side */}
      <svg
        className="absolute top-[22%] left-[2%] hidden h-[56%] w-[16vw] text-brand-secondary xl:block"
        viewBox="0 0 200 500"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M40 490C120 430 20 350 90 280s110-60 70-150S60 40 120 8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="8 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.6"
        />
      </svg>
      <Pin className="top-[19%] left-[9%] hidden h-9 w-9 xl:block" />
      <Pin className="top-[74%] left-[3%] hidden h-7 w-7 opacity-80 xl:block" />

      {/* Floating study icons */}
      <FloatingTile className="top-[26%] left-[12%] bg-brand-primary text-white" rotate={-8}>
        <CapIcon />
      </FloatingTile>
      <FloatingTile className="top-[58%] left-[8%] bg-warning text-white" rotate={10} delay={1.5}>
        <PencilIcon />
      </FloatingTile>
      <FloatingTile className="top-[22%] right-[9%] bg-brand-secondary text-white" rotate={8} delay={0.8}>
        <BookIcon />
      </FloatingTile>
      <FloatingTile className="top-[62%] right-[12%] bg-surface text-warning" rotate={-6} delay={2.2}>
        <BulbIcon />
      </FloatingTile>

      <Sparkle className="top-[14%] left-[22%] h-5 w-5 text-warning" />
      <Sparkle className="top-[48%] right-[5%] h-4 w-4 text-brand-secondary" />
      <Sparkle className="top-[84%] right-[22%] h-6 w-6 text-brand-accent" />
      <Sparkle className="top-[40%] left-[4%] h-4 w-4 text-brand-accent" />

      <Chip
        className="top-[42%] hidden 2xl:flex"
        style={{ left: "4%" }}
        icon={<ShieldIcon />}
        title="Verified tutors"
        subtitle="ID & qualification checked"
      />
      <Chip
        className="top-[42%] hidden 2xl:flex"
        style={{ right: "4%" }}
        icon={<PinIcon />}
        title="Home & online"
        subtitle="Teach or learn your way"
      />

      <svg className="absolute inset-x-0 bottom-0 h-28 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="signup-wave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-brand-secondary)" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="var(--color-brand-accent)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--color-brand-secondary)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path fill="url(#signup-wave)" d="M0 120C240 60 420 170 700 130s520-110 740-40V200H0Z" />
      </svg>
    </div>
  );
}

function FloatingTile({
  className,
  rotate,
  delay = 0,
  children,
}: {
  className: string;
  rotate: number;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "animate-float absolute hidden h-14 w-14 items-center justify-center rounded-2xl shadow-soft lg:flex",
        className,
      )}
      style={{ "--float-rotate": `${rotate}deg`, animationDelay: `${delay}s` } as CSSProperties}
    >
      {children}
    </span>
  );
}

function DotGrid({ className }: { className: string }) {
  return (
    <svg className={cn("absolute h-28 w-40", className)} viewBox="0 0 160 112">
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 18} r="2.5" fill="currentColor" />
        )),
      )}
    </svg>
  );
}

function Sparkle({ className }: { className: string }) {
  return (
    <svg className={cn("absolute hidden md:block", className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l10 5-10 5L2 8l10-5Z" strokeLinejoin="round" />
      <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15Z" strokeLinejoin="round" />
      <path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5A2.5 2.5 0 014 20.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16.5 3.5l4 4L8 20H4v-4L16.5 3.5Z" strokeLinejoin="round" />
      <path d="M14 6l4 4" />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 21h4" strokeLinecap="round" />
      <path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3Z" strokeLinejoin="round" />
    </svg>
  );
}

function Pin({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg className={cn("absolute text-brand-primary drop-shadow", className)} style={style} viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 22s-7-6.4-7-12a7 7 0 1114 0c0 5.6-7 12-7 12Z" />
      <circle cx="12" cy="10" r="2.8" fill="white" />
    </svg>
  );
}

function Chip({
  className,
  style,
  icon,
  title,
  subtitle,
}: {
  className: string;
  style?: CSSProperties;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={cn("absolute flex items-center gap-3 rounded-2xl bg-surface/95 py-2.5 pr-5 pl-2.5 shadow-soft", className)}
      style={style}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white">{icon}</span>
      <span>
        <span className="block text-sm font-semibold text-text-primary">{title}</span>
        <span className="block text-xs text-text-secondary">{subtitle}</span>
      </span>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function AuthFooterLink({ prompt, cta, href }: { prompt: string; cta: string; href: string }) {
  return (
    <p className="text-center text-sm text-text-secondary">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-brand-secondary hover:text-brand-primary">
        {cta}
      </Link>
    </p>
  );
}
