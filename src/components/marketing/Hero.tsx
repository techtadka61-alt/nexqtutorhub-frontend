import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import heroImage from "@/assets/images/hero-tuition.png";

const STATS = [
  { value: "120+", label: "Local tutors" },
  { value: "38", label: "Areas covered" },
  { value: "4.8", label: "Average rating" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="A student doing homework at a wooden desk"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Fades only the left side (behind the copy) so the photo itself stays clear. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, color-mix(in srgb, var(--color-bg) 82%, transparent) 0%, color-mix(in srgb, var(--color-bg) 55%, transparent) 38%, transparent 62%)",
          }}
        />
      </div>

      <Container className="relative flex min-h-[640px] flex-col justify-center gap-6 py-16 sm:min-h-[680px]">
        <span className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-primary">
          <LocationIcon />
          Starting in Sonbhadra, Uttar Pradesh
        </span>

        <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-brand-primary sm:text-5xl lg:text-6xl">
          Find the Right Tutor Near You
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-text-primary">
          Discover trusted local educators matched to your class, subject, area, schedule, and
          budget — without exposing your exact address.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/find-tutors" size="lg" leftIcon={<SearchIcon />}>
            Find a tutor
          </Button>
          <Button href="/signup/tutor" size="lg" variant="outline" rightIcon={<ArrowIcon />}>
            Become a tutor
          </Button>
        </div>

        <dl className="mt-4 grid w-full max-w-xl grid-cols-3 gap-8 border-t border-brand-primary/20 pt-6">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-3xl font-bold text-brand-primary">{stat.value}</dd>
              <p className="text-sm text-text-primary">{stat.label}</p>
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
