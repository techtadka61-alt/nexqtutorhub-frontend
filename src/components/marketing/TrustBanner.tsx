import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function TrustBanner() {
  return (
    <section lang="hi" className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-primary px-8 py-14 sm:px-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-accent/15 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
                भरोसे के साथ शुरुआत
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                अच्छी ट्यूशन की शुरुआत भरोसे से होती है।
              </h2>
              <p className="mt-4 text-white/70">
                Verified badge, प्राइवेसी कंट्रोल, रिपोर्ट करने की सुविधा और प्लेटफ़ॉर्म पर ही बातचीत — ताकि
                पेरेंट्स और ट्यूटर दोनों भरोसे से फ़ैसला ले सकें।
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              भरोसा कैसे बनता है
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
