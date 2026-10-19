import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FaqSection, type FaqItem } from "@/components/marketing/FaqSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { SUBJECT_OPTIONS } from "@/lib/constants";
import {
  SONBHADRA_LOCALITIES,
  breadcrumbJsonLd,
  faqJsonLd,
  jsonLdScript,
  localityPath,
  tuitionServiceJsonLd,
  type Locality,
} from "@/lib/seo";

const CLASS_GROUPS = [
  { title: "Nursery – Class 5", text: "Reading, writing, maths basics and homework help for young children, at home." },
  { title: "Class 6 – Class 8", text: "Maths, Science, English, Hindi and Social Science — building strong foundations." },
  { title: "Class 9 & 10", text: "Board-exam preparation for CBSE, ICSE and UP Board, subject by subject." },
  { title: "Class 11 & 12", text: "Physics, Chemistry, Maths, Biology, Accountancy, Economics and more." },
  { title: "Competitive exams", text: "Guidance for JEE, NEET and other entrance and recruitment exams." },
  { title: "College subjects", text: "Undergraduate subjects with tutors who have studied them." },
];

export function localityFaqs(place: string): FaqItem[] {
  return [
    {
      question: `How do I find a home tutor in ${place}?`,
      answer: `Post your requirement on NexTutorHub — class, board, subjects, budget and timing — and share where you need tuition. Verified tutors within 10 km of you in ${place} are notified and apply, and you choose the one you like. It takes about a minute.`,
    },
    {
      question: `What is the fee for home tuition in ${place}?`,
      answer:
        "Each tutor sets their own monthly fee, depending on the class, subjects and number of days a week. You set your budget when you post, can compare tutors by fee, and agree the final fee directly with the tutor. NexTutorHub charges no commission.",
    },
    {
      question: `Are the tutors in ${place} verified?`,
      answer:
        "Yes. Every tutor applies with their details and resume, and our team checks their ID and qualifications before they get the Verified badge and can contact students.",
    },
    {
      question: `Do you have tutors for CBSE, ICSE and UP Board students in ${place}?`,
      answer:
        "Yes. Tutors list the boards they teach — CBSE, ICSE and UP Board (State Board) — and you are matched with tutors who teach your board and class, from Nursery to Class 12.",
    },
    {
      question: `I am a teacher in ${place}. How can I get home tuition students?`,
      answer: `Register free as a tutor, complete your profile with your subjects, classes and teaching location, and apply for verification. Once verified, you are notified of student requests within 10 km of you in ${place}, with no listing fee or commission.`,
    },
    {
      question: "Is online tuition also available?",
      answer: "Yes. Choose online or both home and online tuition when you post, and tutors who teach online can apply from anywhere.",
    },
  ];
}

interface HomeTuitionPageProps {
  /** A town page, or the district page when omitted. */
  locality?: Locality;
}

/** Shared layout of the Sonbhadra district page (/home-tuition) and the town pages (/home-tuition/[town]). */
export function HomeTuitionPage({ locality }: HomeTuitionPageProps) {
  const place = locality ? `${locality.name}, Sonbhadra` : "Sonbhadra";
  const shortPlace = locality?.name ?? "Sonbhadra";
  const path = locality ? localityPath(locality.slug) : "/home-tuition";
  const faqs = localityFaqs(shortPlace);
  const nearby = locality
    ? locality.nearby.map((slug) => SONBHADRA_LOCALITIES.find((l) => l.slug === slug)).filter((l): l is Locality => !!l)
    : [];
  const breadcrumb = [
    { name: "Home", path: "/" },
    { name: "Home tuition in Sonbhadra", path: "/home-tuition" },
    ...(locality ? [{ name: `Home tuition in ${locality.name}`, path }] : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(tuitionServiceJsonLd(place, path))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd(breadcrumb))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(faqs))} />

      <section className="bg-surface py-14 sm:py-20">
        <Container className="max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-xs text-text-secondary">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumb.map((item, index) => (
                <li key={item.path} className="flex items-center gap-1.5">
                  {index > 0 && <span aria-hidden>›</span>}
                  {index === breadcrumb.length - 1 ? (
                    <span aria-current="page" className="text-text-primary">
                      {item.name}
                    </span>
                  ) : (
                    <Link href={item.path} className="hover:text-brand-secondary">
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <span className="mt-6 block text-sm font-semibold uppercase tracking-wide text-brand-secondary">
            {locality ? `${locality.hindi} · सोनभद्र` : "सोनभद्र · Uttar Pradesh"}
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-brand-primary sm:text-5xl">
            Home Tuition in {shortPlace} — Verified Home Tutors Near You
          </h1>
          <p className="mt-5 text-lg text-text-secondary">
            {locality ? (
              <>
                Looking for a good home tutor in {locality.name}
                {locality.aliases?.length ? ` (${locality.aliases.join(", ")})` : ""}? {locality.name} is {locality.about}.
                NexTutorHub connects students and parents here with verified tutors who teach within 10 km of your home —
                for every class, board and subject.
              </>
            ) : (
              <>
                NexTutorHub is Sonbhadra&rsquo;s home-tuition platform. Students and parents across the district — from
                Robertsganj and Obra to Renukoot, Anpara and Dudhi — post what they need, and verified tutors within 10 km
                apply. Free for students and tutors.
              </>
            )}
          </p>
          <p className="mt-3 text-text-secondary">
            {shortPlace} में होम ट्यूशन चाहिए? अपनी ज़रूरत बताइए — कक्षा, बोर्ड, विषय और बजट — और 10 किमी के अंदर के
            वेरिफ़ाइड ट्यूटर आपसे संपर्क करेंगे।
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/request-tutor" size="lg">
              Find a tutor in {shortPlace}
            </Button>
            <Button href="/signup/tutor" size="lg" variant="outline">
              Become a tutor in {shortPlace}
            </Button>
          </div>
          <ul className="mt-8 grid gap-3 text-sm text-text-primary sm:grid-cols-3">
            {["ID & qualification-verified tutors", "Matched within 10 km of you", "Free — no fees, no commission"].map((point) => (
              <li key={point} className="flex items-center gap-2 rounded-xl border border-border bg-bg px-4 py-3">
                <span aria-hidden className="text-success">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">
            Tuition for every class and board in {shortPlace}
          </h2>
          <p className="mt-3 max-w-3xl text-text-secondary">
            Tutors on NexTutorHub teach CBSE, ICSE and UP Board students at home or online. Tell us the class and subjects,
            and you are matched with tutors who teach exactly that.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CLASS_GROUPS.map((group) => (
              <div key={group.title} className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="text-lg font-semibold text-brand-primary">
                  {group.title} tuition in {shortPlace}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{group.text}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-10 text-lg font-semibold text-brand-primary">Subjects tutors teach in {shortPlace}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SUBJECT_OPTIONS.map((subject) => (
              <li key={subject} className="rounded-full bg-brand-secondary-light px-3 py-1.5 text-sm text-brand-primary">
                {subject}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <HowItWorksSection />

      <section className="bg-surface py-14 sm:py-20">
        <Container className="max-w-5xl">
          <h2 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">
            {locality ? `Home tuition near ${locality.name}` : "Home tuition across Sonbhadra"}
          </h2>
          <p className="mt-3 max-w-3xl text-text-secondary">
            Matching works by distance, so students are shown tutors within 10 km wherever they live in the district — not
            just in the towns listed here.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(locality ? nearby : SONBHADRA_LOCALITIES).map((l) => (
              <li key={l.slug}>
                <Link
                  href={localityPath(l.slug)}
                  className="flex flex-col rounded-xl border border-border bg-bg px-4 py-3 transition-colors hover:border-brand-secondary hover:text-brand-secondary"
                >
                  <span className="font-semibold">Home tuition in {l.name}</span>
                  <span className="text-xs text-text-secondary">{l.hindi}</span>
                </Link>
              </li>
            ))}
          </ul>
          {locality && (
            <p className="mt-6 text-sm">
              <Link href="/home-tuition" className="font-semibold text-brand-secondary hover:text-brand-primary">
                See all towns in Sonbhadra →
              </Link>
            </p>
          )}
        </Container>
      </section>

      <WhyChooseUs />
      <FaqSection items={faqs} subtitle={`Common questions about home tuition in ${shortPlace}.`} />
    </>
  );
}
