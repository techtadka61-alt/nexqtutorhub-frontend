import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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
    <div className="bg-gradient-to-br from-brand-secondary-light/70 via-bg to-surface px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[680px] rounded-3xl border border-border/70 bg-surface px-6 py-8 shadow-lifted sm:px-10 sm:py-10">
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
      <Pin className="top-[42%] h-9 w-9" left={`calc(${ILLUSTRATION_WIDTH} * 0.98)`} />
      <Pin className="top-[14%] h-7 w-7 opacity-80" left={`calc(${ILLUSTRATION_WIDTH} * 1.18)`} />

      <Chip
            className="top-[26%]"
            left={`calc(${ILLUSTRATION_WIDTH} * 0.9)`}
            icon={<ShieldIcon />}
            title="Verified tutors"
            subtitle="ID & qualification checked"
          />
          <Chip
            className="top-[62%]"
            left={`calc(${ILLUSTRATION_WIDTH} * 1.02)`}
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

function Pin({ className, left }: { className: string; left: string }) {
  return (
    <svg className={cn("absolute text-brand-primary drop-shadow", className)} style={{ left }} viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 22s-7-6.4-7-12a7 7 0 1114 0c0 5.6-7 12-7 12Z" />
      <circle cx="12" cy="10" r="2.8" fill="white" />
    </svg>
  );
}

function Chip({
  className,
  left,
  icon,
  title,
  subtitle,
}: {
  className: string;
  left: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={cn("absolute flex items-center gap-3 rounded-2xl bg-surface/95 py-2.5 pr-5 pl-2.5 shadow-soft", className)}
      style={{ left }}
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
