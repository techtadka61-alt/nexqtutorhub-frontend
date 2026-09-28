import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FaqSection, TUTOR_FAQS } from "@/components/marketing/FaqSection";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { TuitionApplyPanel } from "@/components/tutors/TuitionApplySection";
import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import tutorApplyImage from "@/assets/images/Tutor-Apply.png";

export const metadata: Metadata = {
  title: "For Tutors — Become a Tutor",
  description:
    "Create your tutor profile on NexTutorHub: add your qualifications, choose home or online tuition, set your teaching area and travel radius, and get discovered by students near you.",
};

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

/** Signed-in users only: guests are sent to login and brought back here afterwards. */
export default function ForTutorsPage() {
  return (
    <ProtectedRoute>
      <section id="apply" className="scroll-mt-24 bg-surface py-14 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="inline-block rounded-full bg-brand-secondary-light px-4 py-1.5 text-xs font-semibold text-brand-primary">
              For tutors & teachers
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-primary sm:text-4xl lg:text-5xl">
              Apply as a <span className="text-brand-secondary">Tutor</span>
            </h1>
            <p className="mt-4 max-w-lg leading-relaxed text-text-secondary">
              Join a growing community of educators on NexTutorHub. Share how you like to teach, upload your
              resume, and our team will review your application before you&apos;re shown to students.
            </p>

            <Image
              src={tutorApplyImage}
              alt="A tutor at her laptop applying on NexTutorHub, with subject and resume checklist cards around her"
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="mx-auto mt-8 h-auto w-full max-w-sm mix-blend-multiply lg:mx-0 lg:max-w-md"
            />

            <ol className="mt-8 grid gap-3 sm:grid-cols-2">
              {APPLY_STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-sm text-text-primary">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-secondary-light text-xs font-bold text-brand-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <TuitionApplyPanel />
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
    </ProtectedRoute>
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
