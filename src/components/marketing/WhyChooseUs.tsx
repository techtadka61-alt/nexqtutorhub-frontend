import Image from "next/image";
import { Container } from "@/components/ui/Container";
import whyChooseUsImage from "@/assets/images/why-choose-us-cutout.png";

const REASONS = [
  {
    title: "Verified Tutors",
    description:
      "Every tutor profile goes through ID and qualification checks before it appears in search, so you know exactly who is teaching your child.",
    icon: <ShieldIcon />,
    tint: "bg-brand-primary text-white",
  },
  {
    title: "Matched to You",
    description:
      "Filter by class, subject, board, budget, schedule and teaching mode — home, online, or both — to find tutors who actually fit your requirement.",
    icon: <TargetIcon />,
    tint: "bg-brand-secondary text-white",
  },
  {
    title: "Privacy First",
    description:
      "Discovery works by area and distance, not your exact address. Your precise location is never shown publicly to the other side.",
    icon: <LockIcon />,
    tint: "bg-brand-accent text-brand-primary",
  },
  {
    title: "Local & Nearby",
    description:
      "Search by city and travel radius to find tutors who can genuinely reach you for home tuition, or teach online from anywhere.",
    icon: <PinIcon />,
    tint: "bg-info text-white",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-surface py-20">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Image
          src={whyChooseUsImage}
          alt="Two students looking at a board of NexTutorHub benefits"
          sizes="(min-width: 1024px) 40vw, 80vw"
          className="mx-auto h-auto w-full max-w-sm lg:max-w-md"
        />

        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
            Why choose us
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            Built for trust, matched by what matters
          </h2>
          <p className="mt-4 text-text-secondary">
            NexTutorHub combines verification, smart matching and privacy controls so families and
            tutors can connect with confidence.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {REASONS.map((reason) => (
              <div key={reason.title} className="flex flex-col gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${reason.tint}`}
                >
                  {reason.icon}
                </span>
                <h3 className="text-base font-semibold text-text-primary">{reason.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 118 0v4" />
    </svg>
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
