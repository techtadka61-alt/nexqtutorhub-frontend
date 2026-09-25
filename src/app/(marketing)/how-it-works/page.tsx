import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { TrustBanner } from "@/components/marketing/TrustBanner";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";

export const metadata: Metadata = {
  title: "How It Works",
  description: "See how students and tutors connect on NexTutorHub, from requirement to active tuition.",
};

const STUDENT_FLOW = [
  {
    title: "Create your requirement",
    description:
      "Tell us your child's class, board, subjects, budget, preferred schedule and whether you want home or online tuition.",
  },
  {
    title: "Discover compatible tutors",
    description:
      "Browse tutors matched to your requirement, filtered by area, distance, fees, experience and verification status.",
  },
  {
    title: "Connect and schedule a demo",
    description:
      "Message shortlisted tutors directly on the platform and schedule a demo class before committing.",
  },
  {
    title: "Start learning and review",
    description:
      "Once you're happy with the demo, start regular tuition and leave a review to help other families.",
  },
];

const TUTOR_FLOW = [
  {
    title: "Build a trusted profile",
    description:
      "Add your qualifications, teaching experience, subjects, classes and boards you're comfortable with.",
  },
  {
    title: "Set your teaching area",
    description:
      "Choose your city, area and a travel radius for home tuition, or mark yourself available online.",
  },
  {
    title: "Find nearby requirements",
    description: "Discover students looking for tutors that match your subjects, classes and location.",
  },
  {
    title: "Express interest and connect",
    description: "Reach out to interested families, schedule a demo, and convert it into ongoing tuition.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-surface py-16 sm:py-20">
        <Container className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
            How it works
          </span>
          <h1 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            From requirement to active tuition, in a few clear steps
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            NexTutorHub is built as a two-sided marketplace — here&rsquo;s what the journey looks like
            for both students and tutors.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-10 lg:grid-cols-2">
          <FlowColumn
            eyebrow="For students & parents"
            title="Find the right tutor, faster"
            steps={STUDENT_FLOW}
            cta={{ href: "/signup/student", label: "Get started as a student" }}
          />
          <FlowColumn
            eyebrow="For tutors & teachers"
            title="Find nearby students who need you"
            steps={TUTOR_FLOW}
            cta={{ href: "/for-tutors", label: "Get started as a tutor" }}
          />
        </Container>
      </section>

      <TrustBanner />
      <WhyChooseUs />
      <CtaSection />
      <FaqSection />
    </>
  );
}

function FlowColumn({
  eyebrow,
  title,
  steps,
  cta,
}: {
  eyebrow: string;
  title: string;
  steps: { title: string; description: string }[];
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">{eyebrow}</span>
        <h2 className="mt-2 font-display text-2xl font-bold text-brand-primary">{title}</h2>
      </div>

      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <Card key={step.title}>
            <CardBody className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.description}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Button href={cta.href} className="w-fit">
        {cta.label}
      </Button>
    </div>
  );
}
