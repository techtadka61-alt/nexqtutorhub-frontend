import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { FaqSection } from "@/components/marketing/FaqSection";
import { Container } from "@/components/ui/Container";
import { RequestTutorForm } from "@/components/students/RequestTutorForm";
import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { UserRole } from "@/types/api";

export const metadata: Metadata = {
  title: "Post a Tuition Requirement — Get a Home Tutor in Sonbhadra",
  description:
    "Tell us your class, board, subjects, location and budget. Verified home tutors within 10 km in Sonbhadra apply to you, and you choose. Free, takes a minute.",
  alternates: { canonical: "/request-tutor" },
  openGraph: pageOpenGraph("Post a Tuition Requirement — Get a Home Tutor in Sonbhadra", "Tell us your class, board, subjects, location and budget. Verified home tutors within 10 km in Sonbhadra apply to you, and you choose. Free, takes a minute.", "/request-tutor"),
};

const HOW_IT_WORKS = [
  "Tell us what you need — class, subjects, home or online",
  "Verified tutors near you apply with a short note",
  "Compare their profiles and accept the one you like",
  "Your phone number is shared only with that tutor",
];

/** Open to guests (they sign up on submit) and students; tutors and admins are told it isn't for them. */
export default function RequestTutorPage() {
  return (
    <ProtectedRoute allow={[UserRole.STUDENT]} allowGuests>
      <section className="bg-surface py-10 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <span className="inline-block rounded-full bg-brand-secondary-light px-4 py-1.5 text-xs font-semibold text-brand-primary">
              For students & parents
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-primary sm:text-4xl lg:text-5xl">
              Find the right <span className="text-brand-secondary">tutor</span>
            </h1>
            <p className="mt-4 max-w-lg leading-relaxed text-text-secondary">
              Post your requirement once and let verified tutors come to you —
              no endless scrolling or cold calls.
            </p>
            <ol className="mt-8 hidden gap-3 sm:grid">
              {HOW_IT_WORKS.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3 text-sm text-text-primary"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-secondary-light text-xs font-bold text-brand-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-5 shadow-soft sm:p-8">
            <RequestTutorForm />
          </div>
        </Container>
      </section>
      <FaqSection />
    </ProtectedRoute>
  );
}
