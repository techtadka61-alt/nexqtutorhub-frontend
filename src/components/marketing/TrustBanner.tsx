import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function TrustBanner() {
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-primary px-8 py-14 sm:px-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-accent/15 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
                A safer local start
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                Good tuition starts with a clear, trusted connection.
              </h2>
              <p className="mt-4 text-white/70">
                Verification states, privacy controls, reporting, and in-platform communication
                help both sides decide with confidence.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              How trust works
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
