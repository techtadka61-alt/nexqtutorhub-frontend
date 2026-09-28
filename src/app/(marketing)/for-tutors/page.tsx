import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FaqSection, TUTOR_FAQS } from "@/components/marketing/FaqSection";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { TuitionApplyPanel } from "@/components/tutors/TuitionApplySection";

export const metadata: Metadata = {
  title: "For Tutors — Become a Tutor",
  description:
    "Create your tutor profile on NexTutorHub: add your qualifications, choose home or online tuition, set your teaching area and travel radius, and get discovered by students near you.",
};

const BENEFITS = [
  {
    title: "Get discovered locally",
    description:
      "Students search by city, area and distance. Set your travel radius once and appear in every matching search nearby.",
    icon: <PinIcon />,
  },
  {
    title: "Choose your mode",
    description:
      "Teach at the student's home, online, or both — you decide per your comfort and availability.",
    icon: <LaptopIcon />,
  },
  {
    title: "Build a trusted profile",
    description:
      "Add your qualifications and experience. Verified tutors are shown as trusted, boosting response rates.",
    icon: <BadgeIcon />,
  },
  {
    title: "Set your own fees",
    description: "You control your monthly fees and availability — no hidden commission surprises.",
    icon: <RupeeIcon />,
  },
];

const STEPS = [
  {
    title: "Create your account",
    description: "Sign up with your name, email and mobile number. Verify your email to activate your account.",
  },
  {
    title: "Fill your teaching profile",
    description:
      "Add your qualifications, experience, subjects, classes and boards. Upload your CV so families can review your background.",
  },
  {
    title: "Set your teaching area",
    description:
      "Choose home tuition, online tuition, or both. For home tuition, set your city, area and how far you can travel.",
  },
  {
    title: "Start getting matched",
    description: "Appear in student searches immediately, and get verified for even higher visibility.",
  },
];

const APPLY_STEPS = [
  "Register as a tutor",
  "Verify your email from the link we send you",
  "Sign in — you'll land back on this page",
  "Fill the form, upload your resume and submit",
];

export default function ForTutorsPage() {
  return (
    <>
      <section className="bg-brand-primary py-16 text-white sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-accent">
              For tutors & teachers
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Teach where you want. Get found by students who need exactly what you teach.
            </h1>
            <p className="mt-4 max-w-lg text-white/70">
              Build a profile once — your subjects, classes, boards, experience and CV — and choose
              home tuition, online tuition, or both, along with the city, area and travel radius you
              prefer. NexTutorHub matches you with nearby students automatically.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#apply" size="lg" variant="secondary">
                Apply for tuition
              </Button>
              <Button href="#how-it-works" size="lg" variant="outline-inverse">
                See how it works
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent text-brand-primary">
                  {b.icon}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-white">{b.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{b.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="apply" className="scroll-mt-24 bg-surface py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
              Apply for tuition
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-brand-primary">
              Start teaching with NexTutorHub
            </h2>
            <p className="mt-4 text-text-secondary">
              Tell us how you want to teach and share your resume. Our team reviews every application
              before tutors are shown to students.
            </p>
            <ol className="mt-8 flex flex-col gap-4">
              {APPLY_STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-sm text-text-primary">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-secondary-light text-sm font-bold text-brand-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-border bg-bg p-6 shadow-card sm:p-8">
            <TuitionApplyPanel />
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
              Getting started
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-brand-primary">
              Set up your profile in four steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <Card key={step.title}>
                <CardBody className="flex flex-col gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary-light text-sm font-bold text-brand-primary">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{step.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
              Teaching preferences
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-brand-primary sm:text-3xl">
              Home, online, or both — your call
            </h2>
            <p className="mt-4 text-text-secondary">
              When you set up your profile, tell us exactly how you want to teach:
            </p>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-text-primary">
              <li className="flex gap-3">
                <CheckDot /> Home tuition in a specific city and area, within a travel radius you set
              </li>
              <li className="flex gap-3">
                <CheckDot /> Online tuition from anywhere, for students who prefer remote classes
              </li>
              <li className="flex gap-3">
                <CheckDot /> Both — appear in home-tuition search near you and online search everywhere
              </li>
            </ul>
            <p className="mt-5 text-sm text-text-secondary">
              This is the same area-and-radius model students use to describe where they need a tutor
              — so matching works accurately on both sides.
            </p>
          </div>

          <Card>
            <CardBody className="flex flex-col gap-5">
              <h3 className="text-base font-semibold text-text-primary">What your profile includes</h3>
              <ul className="flex flex-col gap-3 text-sm text-text-secondary">
                <li className="flex justify-between border-b border-border pb-3">
                  <span>Subjects, classes & boards</span>
                  <span className="font-medium text-text-primary">Required</span>
                </li>
                <li className="flex justify-between border-b border-border pb-3">
                  <span>Qualification & experience</span>
                  <span className="font-medium text-text-primary">Required</span>
                </li>
                <li className="flex justify-between border-b border-border pb-3">
                  <span>City, area & travel radius</span>
                  <span className="font-medium text-text-primary">Required</span>
                </li>
                <li className="flex justify-between border-b border-border pb-3">
                  <span>Monthly fees & availability</span>
                  <span className="font-medium text-text-primary">Required</span>
                </li>
                <li className="flex justify-between">
                  <span>CV / resume upload</span>
                  <span className="font-medium text-text-primary">Recommended</span>
                </li>
              </ul>
              <Button href="/signup/tutor" className="w-full">
                Start your tutor profile
              </Button>
            </CardBody>
          </Card>
        </Container>
      </section>

      <WhyChooseUs />
      <CtaSection />
      <FaqSection items={TUTOR_FAQS} subtitle="Everything you need to know before you start teaching." />
    </>
  );
}

function CheckDot() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
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

function LaptopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="5" width="16" height="10" rx="1.5" />
      <path d="M2 19h20" strokeLinecap="round" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RupeeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4h12M6 9h12M6 4c4 0 6 2 6 5s-2 5-6 5h-1l7 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
