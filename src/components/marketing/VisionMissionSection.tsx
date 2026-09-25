import Image from "next/image";
import { Container } from "@/components/ui/Container";
import visionMissionImage from "@/assets/images/vision-mission.png";

const PILLARS = [
  {
    title: "Our Vision",
    icon: <EyeIcon />,
    tint: "border-brand-accent/50 bg-brand-secondary-light/60",
    iconTint: "bg-brand-secondary",
    statement:
      "A future where every student, in every town, can find a trusted tutor nearby — and every good teacher is discovered for their skill, not just word of mouth.",
  },
  {
    title: "Our Mission",
    icon: <TargetIcon />,
    tint: "border-warning/30 bg-warning/10",
    iconTint: "bg-brand-primary",
    statement:
      "To make finding the right tutor simple, safe and local — with verified tutor profiles, matching by class, subject, board, budget and schedule, and exact addresses kept private until both sides connect.",
  },
];

export function VisionMissionSection() {
  return (
    <section className="bg-surface py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 font-script text-3xl font-bold text-warning">
            <SparkleIcon />
            Vision &amp; Mission
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            What drives NexTutorHub
          </h2>
        </div>

        {/* Image left, cards stacked right; the cards column is centred against the image height. */}
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <Image
            src={visionMissionImage}
            alt="A student looking ahead through a telescope and another working on a laptop beside a target"
            sizes="(min-width: 1024px) 55vw, 95vw"
            className="mx-auto h-auto w-full max-w-2xl lg:max-w-none"
          />

          <div className="flex flex-col gap-5">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className={`rounded-3xl border p-6 sm:p-7 ${pillar.tint}`}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${pillar.iconTint}`}
                  >
                    {pillar.icon}
                  </span>
                  <h3 className="font-display text-xl font-bold text-brand-primary">{pillar.title}</h3>
                </div>
                <p className="mt-4 leading-relaxed text-text-secondary">{pillar.statement}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}
