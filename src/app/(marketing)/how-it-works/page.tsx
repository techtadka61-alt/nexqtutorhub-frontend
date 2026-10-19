import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TrustBanner } from "@/components/marketing/TrustBanner";
import { HighlightsSection } from "@/components/marketing/HighlightsSection";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { MatchingIllustration } from "@/components/marketing/MatchingIllustration";
import { ProcessAnimation } from "@/components/process-3d/ProcessAnimation";

export const metadata: Metadata = {
  title: "How It Works — Find a Home Tutor in Sonbhadra in 3 Steps",
  description:
    "Post your tuition requirement, get applications from verified tutors within 10 km, call them and choose. See how NexTutorHub works for students and tutors in Sonbhadra.",
  alternates: { canonical: "/how-it-works" },
  openGraph: pageOpenGraph("How It Works — Find a Home Tutor in Sonbhadra in 3 Steps", "Post your tuition requirement, get applications from verified tutors within 10 km, call them and choose. See how NexTutorHub works for students and tutors in Sonbhadra.", "/how-it-works"),
};

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STUDENT_FLOW: Step[] = [
  {
    title: "Post your requirement",
    description:
      "Tell us the class, board, subjects, budget, timing and whether you want home or online tuition. Your exact location is never shown to tutors.",
    icon: <ClipboardIcon />,
  },
  {
    title: "Nearby tutors are notified",
    description:
      "Verified tutors within 10 km get your request instantly. For online tuition it reaches tutors who teach those subjects online. You can also browse tutors near you.",
    icon: <BellIcon />,
  },
  {
    title: "Compare the tutors who apply",
    description:
      "See each tutor's qualification, experience, subjects, fees, distance and verified badge — all in one place.",
    icon: <UsersIcon />,
  },
  {
    title: "Accept and start learning",
    description:
      "Accept the tutor you like. Only then are contact details shared, so you can fix a demo class and begin.",
    icon: <CheckCircleIcon />,
  },
];

const TUTOR_FLOW: Step[] = [
  {
    title: "Build your profile & get verified",
    description:
      "Add your qualifications, experience, subjects, classes, boards and resume. Our team reviews and verifies your profile.",
    icon: <ShieldIcon />,
  },
  {
    title: "Set your area and time slots",
    description:
      "Pin where you teach, choose home, online or both, and add the days and hours you're free each week.",
    icon: <PinIcon />,
  },
  {
    title: "Get alerts for nearby students",
    description:
      "When a student within 10 km posts a requirement, you're notified right away — no searching needed.",
    icon: <BellIcon />,
  },
  {
    title: "Apply and get accepted",
    description:
      "Send a short note with your application. When the student accepts, you receive their contact details.",
    icon: <HandshakeIcon />,
  },
];

const PROMISES = [
  { title: "Only within 10 km", description: "Home tuition is matched by real distance, so tutors are always nearby.", icon: <RadarIcon /> },
  { title: "Verified tutors only", description: "Only tutors approved by our team can see and apply to requests.", icon: <ShieldIcon /> },
  { title: "Private until you accept", description: "Phone number and address are shared only with the tutor you choose.", icon: <LockIcon /> },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-surface">
        {/* soft background shapes */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-secondary-light blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-accent/25 blur-3xl" />

        <Container className="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-brand-primary sm:text-5xl">
              From requirement to active tuition, in a few clear steps
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-text-secondary lg:mx-0">
              Post what you need, and verified tutors within 10 km are notified instantly. Compare who applies, accept
              the one you like — your details stay private until you do.
            </p>
            <ul className="mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-text-primary lg:mx-0 lg:justify-start">
              {["Free to post", "Verified tutors", "Within 10 km"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-secondary-light text-brand-secondary">
                    <TickIcon />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <MatchingIllustration />
        </Container>
      </section>

      <section className="bg-bg pt-16 sm:pt-20">
        <Container className="flex flex-col gap-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-brand-primary sm:text-4xl">Watch the whole journey</h2>
            <p className="mt-3 text-text-secondary">
              From the moment a student posts a requirement to the day the request is closed — in under a minute.
            </p>
          </div>
          <ProcessAnimation />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="flex flex-col gap-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-brand-primary sm:text-4xl">Two journeys, one simple flow</h2>
            <p className="mt-3 text-text-secondary">
              Whether you&apos;re looking for a tutor or looking for students, here&apos;s exactly what happens.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <FlowColumn
              tone="primary"
              eyebrow="For students & parents"
              title="Find the right tutor, faster"
              steps={STUDENT_FLOW}
              cta={{ href: "/request-tutor", label: "Post your requirement" }}
            />
            <FlowColumn
              tone="secondary"
              eyebrow="For tutors & teachers"
              title="Find nearby students who need you"
              steps={TUTOR_FLOW}
              cta={{ href: "/for-tutors", label: "Get started as a tutor" }}
            />
          </div>
        </Container>
      </section>

      <section className="bg-brand-primary py-14 text-white">
        <Container className="grid gap-8 md:grid-cols-3">
          {PROMISES.map((promise) => (
            <div key={promise.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-accent">
                {promise.icon}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">{promise.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/75">{promise.description}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      <TrustBanner />
      <WhyChooseUs />
      <HighlightsSection />
      <CtaSection />
      <FaqSection />
    </>
  );
}

function FlowColumn({
  tone,
  eyebrow,
  title,
  steps,
  cta,
}: {
  tone: "primary" | "secondary";
  eyebrow: string;
  title: string;
  steps: Step[];
  cta: { href: string; label: string };
}) {
  const badge = tone === "primary" ? "bg-brand-primary" : "bg-brand-secondary";
  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${badge}`}>
          {tone === "primary" ? <StudentIcon /> : <TeacherIcon />}
        </span>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">{eyebrow}</span>
          <h3 className="font-display text-xl font-bold text-brand-primary sm:text-2xl">{title}</h3>
        </div>
      </div>

      <ol className="relative flex flex-col gap-7">
        {/* timeline rail */}
        <span className="absolute bottom-6 left-6 top-6 w-px bg-gradient-to-b from-brand-secondary/60 via-border to-transparent" aria-hidden />
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4">
            <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-surface bg-brand-secondary-light text-brand-primary">
              {step.icon}
              <span
                className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${badge}`}
              >
                {index + 1}
              </span>
            </span>
            <div className="pt-1.5">
              <h4 className="font-semibold text-text-primary">{step.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <Button href={cta.href} variant={tone === "primary" ? "primary" : "secondary"} className="mt-auto w-fit">
        {cta.label}
      </Button>
    </div>
  );
}

const svg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ClipboardIcon() {
  return (
    <svg {...svg}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg {...svg}>
      <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9Z" />
      <path d="M10.3 21a1.94 1.94 0 003.4 0" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg {...svg}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
      <path d="M16 4.5a3.5 3.5 0 010 7M18.5 14.5c1.8.9 3 2.9 3 5.5" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg {...svg}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.8 2.8L16.5 9.5" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg {...svg}>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3Z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg {...svg}>
      <path d="M12 21s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function HandshakeIcon() {
  return (
    <svg {...svg}>
      <path d="M3 11l4-4 4 2 3-2 7 5" />
      <path d="M7 7l-4 4 6 6c.8.8 2 .8 2.8 0l5.7-5.7" />
      <path d="M11 13l2 2M13 11l2.5 2.5" />
    </svg>
  );
}
function RadarIcon() {
  return (
    <svg {...svg} width={22} height={22}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg {...svg} width={22} height={22}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}
function StudentIcon() {
  return (
    <svg {...svg} width={22} height={22}>
      <path d="M2 9l10-5 10 5-10 5L2 9Z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6" />
    </svg>
  );
}
function TeacherIcon() {
  return (
    <svg {...svg} width={22} height={22}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4M7 9h6M7 12h4" />
    </svg>
  );
}
function TickIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
