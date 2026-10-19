import Image from "next/image";
import { PLATFORM_STATS } from "@/lib/platform-stats";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import heroImage from "@/assets/images/hero-tuition.png";

const STATS = [
  { value: PLATFORM_STATS.verifiedTutors, label: "Verified tutors" },
  { value: PLATFORM_STATS.studentsTaught, label: "Students taught" },
  { value: PLATFORM_STATS.fiveStarReviews, label: "Five-star reviews" },
];

/**
 * Three layouts from one <Image> (only its wrapper's positioning changes, so the photo is downloaded once):
 * - below lg: copy on a soft tint, the photo in its own block underneath (text over a photo is unreadable on phones);
 * - lg: copy on the left half, the photo on the right half;
 * - xl: the photo fills the section behind the copy, faded on the left.
 */
export function Hero() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-gradient-to-b from-brand-secondary-light/60 via-bg to-bg xl:bg-none">
      <div className="relative order-2 aspect-[4/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:order-none lg:aspect-auto lg:w-1/2 xl:w-full">
        <Image
          src={heroImage}
          alt="A tutor helping a student with homework at home"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center] xl:object-center"
        />
        {/* Phones/tablets: blends the photo's top edge into the copy above it. */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-bg to-transparent lg:hidden" />
        {/* lg (photo on the right half): softens the photo's left edge into the copy. */}
        <div aria-hidden className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-bg to-transparent lg:block xl:hidden" />
        {/* xl (full-width photo): fades only the left side (behind the copy) so the photo itself stays clear. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden xl:block"
          style={{
            background:
              "linear-gradient(to right, color-mix(in srgb, var(--color-bg) 82%, transparent) 0%, color-mix(in srgb, var(--color-bg) 55%, transparent) 38%, transparent 62%)",
          }}
        />
      </div>

      <Container className="relative order-1 flex flex-col gap-4 pb-8 pt-8 sm:gap-6 sm:pb-12 sm:pt-12 lg:order-none lg:min-h-[640px] lg:justify-center lg:py-16 lg:pr-[calc(50%+2rem)] xl:min-h-[680px] xl:pr-10">
        <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-brand-primary sm:text-sm">
          <LocationIcon />
          Starting in Sonbhadra, Uttar Pradesh
        </span>

        <h1 className="max-w-2xl text-balance font-display text-[clamp(2rem,8.5vw,3rem)] font-bold leading-[1.08] tracking-tight text-brand-primary xl:text-6xl">
          Find the Right Tutor Near You
        </h1>

        <p className="max-w-xl text-[15px] leading-relaxed text-text-primary sm:text-lg">
          Discover trusted local educators matched to your class, subject, area, schedule, and
          budget — without exposing your exact address.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            href="/request-tutor"
            size="lg"
            leftIcon={<SearchIcon />}
            className="whitespace-nowrap max-sm:h-12 max-sm:flex-1 max-sm:px-4 max-sm:text-sm"
          >
            Find a tutor
          </Button>
          <Button
            href="/signup/tutor"
            size="lg"
            variant="outline"
            rightIcon={<ArrowIcon />}
            className="whitespace-nowrap max-sm:h-12 max-sm:flex-1 max-sm:px-4 max-sm:text-sm"
          >
            Become a tutor
          </Button>
        </div>

        <dl className="mt-2 grid w-full max-w-xl grid-cols-3 gap-3 border-t border-brand-primary/20 pt-5 sm:mt-4 sm:gap-8 sm:pt-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-[clamp(1.375rem,6vw,1.875rem)] font-bold text-brand-primary">{stat.value}</dd>
              <p className="text-xs leading-snug text-text-primary sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
