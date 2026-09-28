import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { HighlightsSection } from "@/components/marketing/HighlightsSection";
import { VisionMissionSection } from "@/components/marketing/VisionMissionSection";
import aboutStudentsImage from "@/assets/images/about-students-cutout.png";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "NexTutorHub is a local home-tuition marketplace connecting students and tutors, starting in Sonbhadra, Uttar Pradesh.",
};

const VALUES = [
  {
    title: "Trust first",
    description: "Every tutor is verified before they're discoverable, and privacy controls protect exact addresses.",
  },
  {
    title: "Local by design",
    description: "We start city by city, so every match is genuinely reachable — not a nationwide directory.",
  },
  {
    title: "Fair for both sides",
    description: "Students find quality tutors; tutors find real, nearby opportunities without middlemen fees.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-surface py-16 sm:py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
              About NexTutorHub
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
              A local tuition marketplace, built on trust
            </h1>
            <p className="mt-4 text-text-secondary">
              NexTutorHub connects students and parents with verified local tutors for home and
              online tuition. We started in Sonbhadra, Uttar Pradesh, with a simple idea: finding a
              good tutor nearby shouldn&rsquo;t depend on word of mouth alone, and it shouldn&rsquo;t
              require giving up your privacy either.
            </p>
            <p className="mt-4 text-text-secondary">
              Students describe what they need — class, board, subjects, budget, schedule and mode —
              and tutors describe what they teach and where. Our matching brings the two together,
              while exact addresses stay private until both sides are ready to connect.
            </p>
            <div className="mt-8 flex gap-3">
              <Button href="/find-tutors">Find a tutor</Button>
              <Button href="/for-tutors" variant="outline">
                Become a tutor
              </Button>
            </div>
          </div>
          <Image
            src={aboutStudentsImage}
            alt="Students studying together around a table with laptops"
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="h-auto w-full"
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-6 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-lg font-semibold text-brand-primary">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{value.description}</p>
            </div>
          ))}
        </Container>
      </section>

      <VisionMissionSection />
      <HighlightsSection />
      <WhyChooseUs />
      <CtaSection />
      <FaqSection />
    </>
  );
}
