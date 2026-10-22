import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

interface City {
  name: string;
  hindi: string;
  tagline: string;
  icon: ReactNode;
}

/** Next cities on the roadmap, in launch order. */
const CITIES: City[] = [
  { name: "Mirzapur", hindi: "मिर्ज़ापुर", tagline: "Vindhyachal hills", icon: <HillTempleIcon /> },
  { name: "Banaras", hindi: "बनारस", tagline: "Kashi · the ghats", icon: <GhatIcon /> },
  { name: "Prayagraj", hindi: "प्रयागराज", tagline: "City of the Sangam", icon: <SangamIcon /> },
  { name: "Lucknow", hindi: "लखनऊ", tagline: "City of Nawabs", icon: <GatewayIcon /> },
  { name: "Ayodhya", hindi: "अयोध्या", tagline: "Ram Janmabhoomi", icon: <TempleIcon /> },
  { name: "Kanpur", hindi: "कानपुर", tagline: "Ghanta Ghar city", icon: <ClockTowerIcon /> },
];

/**
 * "Coming soon to your city" — the expansion roadmap across Uttar Pradesh, shown at the very bottom of every site
 * page (rendered by the marketing layout, just above the footer). Sonbhadra is live; the rest are next.
 */
export function ComingSoonCities() {
  return (
    <section
      aria-labelledby="coming-soon-title"
      className="relative overflow-hidden bg-gradient-to-b from-bg to-brand-secondary-light/60 py-16 sm:py-20"
    >
      {/* Soft dotted "map" texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(var(--color-brand-secondary)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-secondary">
            <RouteIcon /> Expanding across Uttar Pradesh
          </span>
          <h2 id="coming-soon-title" className="mt-4 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            Coming{" "}
            <span className="font-script text-4xl font-bold text-warning-display sm:text-5xl">soon</span> to your city
          </h2>
          <p className="mt-3 text-text-secondary">
            We started in Sonbhadra. Verified home tutors are coming next to these cities — register early and be among
            the first tutors and students there.
          </p>
        </div>

        {/* Live now */}
        <div className="mx-auto mt-10 flex w-fit flex-wrap items-center justify-center gap-3 rounded-2xl border border-success/30 bg-surface px-5 py-3 shadow-card">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
          </span>
          <span className="text-sm font-semibold text-success-strong">Live now</span>
          <span className="text-sm text-text-primary">
            <Link href="/home-tuition" className="font-semibold hover:text-brand-secondary">
              Sonbhadra
            </Link>{" "}
            —{" "}
            {(["robertsganj", "obra", "chopan"] as const).map((slug, index) => (
              <span key={slug}>
                {index > 0 && " · "}
                <Link href={`/home-tuition/${slug}`} className="hover:text-brand-secondary hover:underline">
                  {slug.charAt(0).toUpperCase() + slug.slice(1)}
                </Link>
              </span>
            ))}
          </span>
        </div>

        {/* Route + cities */}
        <div className="relative mt-10">
          <svg
            aria-hidden
            className="absolute left-0 right-0 top-[52px] hidden h-6 w-full text-brand-secondary/50 lg:block"
            preserveAspectRatio="none"
            viewBox="0 0 1200 24"
            fill="none"
          >
            <path d="M40 12 C 240 -6, 360 30, 600 12 S 960 -6, 1160 12" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
          </svg>

          <ol className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CITIES.map((city, index) => (
              <li
                key={city.name}
                className="group flex flex-col items-center rounded-2xl border border-border bg-surface/90 px-3 pb-5 pt-5 text-center shadow-card backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-brand-secondary/50"
              >
                <span className="relative flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-secondary-light to-surface text-brand-primary ring-1 ring-brand-secondary/20 transition-colors group-hover:text-brand-secondary">
                  {city.icon}
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-brand-primary">{city.name}</h3>
                <p className="text-sm text-text-secondary">{city.hindi}</p>
                <p className="mt-1 text-xs text-text-secondary">{city.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning-strong">
                  <ClockIcon /> Coming soon
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-6">
          <Link
            href="/signup/tutor"
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-primary-hover"
          >
            Teach in these cities? Register early →
          </Link>
          <Link href="/contact" className="font-semibold text-brand-secondary underline-offset-4 hover:text-brand-primary hover:underline">
            Want us in your city? Tell us
          </Link>
        </div>
      </Container>
    </section>
  );
}

// ---- Landmark line icons (42px, stroke = currentColor)

const ICON = { width: 42, height: 42, viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** Mirzapur: Vindhyachal hills with a hilltop shrine. */
function HillTempleIcon() {
  return (
    <svg {...ICON}>
      <path d="M3 40l12-16 7 8 8-12 15 20H3Z" />
      <path d="M27 20v-5l3-4 3 4v5" />
      <path d="M30 11V7l3 1.5L30 10" />
      <path d="M9 40l6-7 5 7" />
    </svg>
  );
}

/** Banaras: temple above the ghat steps, with the Ganga below. */
function GhatIcon() {
  return (
    <svg {...ICON}>
      <path d="M24 5l5 8v6H19v-6l5-8Z" />
      <path d="M24 5V2" />
      <path d="M15 19h18v5H15z" />
      <path d="M10 24h28v4H10zM6 28h36v4H6z" />
      <path d="M4 38c3-2 5-2 8 0s5 2 8 0 5-2 8 0 5 2 8 0 5-2 8 0" />
      <path d="M4 44c3-2 5-2 8 0s5 2 8 0 5-2 8 0 5 2 8 0 5-2 8 0" />
    </svg>
  );
}

/** Prayagraj: two rivers meeting at the Sangam, with a boat. */
function SangamIcon() {
  return (
    <svg {...ICON}>
      <path d="M4 8c8 4 12 10 20 16" />
      <path d="M44 8c-8 4-12 10-20 16" />
      <path d="M24 24v18" />
      <path d="M14 34h20l-3 5H17l-3-5Z" />
      <path d="M24 34V26l7 6" />
      <path d="M6 44h36" />
    </svg>
  );
}

/** Lucknow: Rumi Darwaza gateway arch. */
function GatewayIcon() {
  return (
    <svg {...ICON}>
      <path d="M6 44V22c0-10 8-17 18-17s18 7 18 17v22" />
      <path d="M16 44V28a8 8 0 0116 0v16" />
      <path d="M24 5V2" />
      <path d="M6 22h4M38 22h4" />
      <path d="M3 44h42" />
      <circle cx="24" cy="14" r="2" />
    </svg>
  );
}

/** Ayodhya: temple with a tall shikhara and flag. */
function TempleIcon() {
  return (
    <svg {...ICON}>
      <path d="M24 6l8 14H16l8-14Z" />
      <path d="M24 6V2l5 1.5L24 5" />
      <path d="M12 20h24v6H12z" />
      <path d="M8 26h32v18H8z" />
      <path d="M20 44v-8a4 4 0 018 0v8" />
      <path d="M12 32h4M32 32h4" />
    </svg>
  );
}

/** Kanpur: Ghanta Ghar clock tower. */
function ClockTowerIcon() {
  return (
    <svg {...ICON}>
      <path d="M24 3l6 8H18l6-8Z" />
      <path d="M18 11h12v33H18z" />
      <circle cx="24" cy="19" r="4" />
      <path d="M24 17v2l1.5 1" />
      <path d="M21 30h6M21 36h6" />
      <path d="M10 44h28" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h7a3.5 3.5 0 000-7H9a3.5 3.5 0 010-7h7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}
