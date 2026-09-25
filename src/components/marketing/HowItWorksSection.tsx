import Link from "next/link";
import { Container } from "@/components/ui/Container";

const STUDENT_STEPS = [
  "Create your requirement",
  "Discover compatible tutors",
  "Connect and schedule a demo",
  "Start learning and review",
];

const TUTOR_STEPS = [
  "Build a trusted profile",
  "Find nearby requirements",
  "Express interest and connect",
  "Start teaching and grow",
];

export function HowItWorksSection() {
  return (
    <section className="bg-bg py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
            Two-sided marketplace
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            One clear path, whichever side you&rsquo;re on
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <StepCard
            title="For students & parents"
            steps={STUDENT_STEPS}
            href="/signup/student"
            cta="Explore student workspace"
          />
          <StepCard
            title="For tutors & teachers"
            steps={TUTOR_STEPS}
            href="/for-tutors"
            cta="Explore tutor workspace"
          />
        </div>
      </Container>
    </section>
  );
}

function StepCard({
  title,
  steps,
  href,
  cta,
}: {
  title: string;
  steps: string[];
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-8">
      <h3 className="font-display text-xl font-bold text-brand-primary">{title}</h3>
      <ol className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-text-primary">{step}</span>
          </li>
        ))}
      </ol>
      <Link
        href={href}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-secondary hover:text-brand-primary"
      >
        {cta}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
