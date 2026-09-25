import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import msmeLogo from "@/assets/images/msme-logo.png";
import nexqiraLogo from "@/assets/images/nexqira.jpeg";
import classroomIllustration from "@/assets/images/tutors-teach-cutout.png";
import reviewsIllustration from "@/assets/images/review-cutout.png";

// Placeholder figures — replace with real numbers before launch.
const STUDENTS_TAUGHT = "1100+";
const FIVE_STAR_REVIEWS = "1000+";

/** Trust highlights (MSME recognition, parent company, traction). Shared across marketing pages. */
export function HighlightsSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <CurlyArrow className="absolute top-8 left-[4%] hidden w-28 lg:block xl:left-[10%]" />
      <CurlyArrow className="absolute top-8 right-[4%] hidden w-28 -scale-x-100 lg:block xl:right-[10%]" />

      <Container>
        <h2 className="text-center font-display text-3xl font-bold text-brand-primary sm:text-4xl">
          Highlights{" "}
          <span className="font-script text-4xl font-bold text-warning sm:text-5xl">@nextutorhub</span>
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
          <HighlightCard className="border-warning/40 bg-warning/10">
            <p className="font-display text-base font-bold text-brand-primary">NexTutorHub</p>
            <p className="text-xs font-medium text-text-primary">Identified &amp; supported by</p>
            <p className="text-[9px] uppercase leading-tight tracking-wide text-text-secondary">
              Ministry of Micro, Small &amp; Medium Enterprises
            </p>
            <Image
              src={msmeLogo}
              alt="MSME — Ministry of Micro, Small & Medium Enterprises"
              sizes="80px"
              className="mt-auto h-20 w-auto"
            />
          </HighlightCard>

          <HighlightCard className="border-black bg-black">
            <p className="font-display text-lg font-bold text-white">A Product by</p>
            <Image src={nexqiraLogo} alt="Nexqira" sizes="112px" className="mt-auto h-28 w-auto" />
          </HighlightCard>

          <HighlightCard className="border-border bg-surface">
            <p className="font-display text-2xl font-bold text-brand-primary">{STUDENTS_TAUGHT}</p>
            <p className="text-sm font-medium text-text-primary">Students Taught</p>
            <Image
              src={classroomIllustration}
              alt="A tutor teaching a class of happy students"
              sizes="160px"
              className="mt-auto h-24 w-auto"
            />
          </HighlightCard>

          <HighlightCard className="border-warning/40 bg-warning/10">
            <p className="font-display text-2xl font-bold text-brand-primary">{FIVE_STAR_REVIEWS}</p>
            <p className="text-sm font-medium text-text-primary">Five-Star Reviews</p>
            <Image
              src={reviewsIllustration}
              alt="Two students holding up a five-star review"
              sizes="160px"
              className="mt-auto h-24 w-auto"
            />
          </HighlightCard>
        </div>
      </Container>
    </section>
  );
}

function HighlightCard({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-h-52 flex-col items-center gap-1 rounded-2xl border-2 px-4 py-5 text-center shadow-card transition-transform duration-200 hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Hand-drawn looping arrow pointing down-right towards the title. */
function CurlyArrow({ className }: { className: string }) {
  return (
    <svg className={cn("text-warning", className)} viewBox="0 0 160 110" fill="none" aria-hidden>
      <path
        d="M78 4C84 30 70 62 44 74 22 84 4 76 8 62c4-14 30-16 56-4 22 10 44 26 66 36"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M112 78l20 16-26 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
