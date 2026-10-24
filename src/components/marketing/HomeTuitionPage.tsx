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

/** In Hindi for parents, with the English place name and "home tutor" / "home tuition" kept for search. */
export function localityFaqs(place: string): FaqItem[] {
  return [
    {
      question: `${place} में home tutor कैसे मिलेगा?`,
      answer: `NexTutorHub पर अपनी ज़रूरत बताएं — क्लास, बोर्ड, सब्जेक्ट, बजट और टाइमिंग — और बताएं कि ट्यूशन कहाँ चाहिए। ${place} में आपके 10 किमी के अंदर के Verified ट्यूटर्स को इसकी खबर मिलती है, वे apply करते हैं, और आप अपनी पसंद का ट्यूटर चुनते हैं। इसमें करीब एक मिनट लगता है।`,
    },
    {
      question: `${place} में home tuition की फीस कितनी है?`,
      answer:
        "हर ट्यूटर अपनी महीने की फीस खुद तय करता है — क्लास, सब्जेक्ट और हफ़्ते में कितने दिन पढ़ाना है, इसके हिसाब से। Requirement डालते समय आप अपना बजट बताते हैं, ट्यूटर्स की फीस की तुलना कर सकते हैं और फाइनल फीस सीधे ट्यूटर से तय करते हैं। NexTutorHub कोई कमीशन नहीं लेता।",
    },
    {
      question: `क्या ${place} के ट्यूटर verified हैं?`,
      answer:
        "हाँ। हर ट्यूटर अपनी जानकारी और resume के साथ apply करता है, और हमारी टीम उनकी ID और qualification चेक करती है। उसके बाद ही उन्हें Verified badge मिलता है और वे स्टूडेंट्स से संपर्क कर पाते हैं।",
    },
    {
      question: `क्या ${place} में CBSE, ICSE और UP Board के लिए ट्यूटर हैं?`,
      answer:
        "हाँ। ट्यूटर बताते हैं कि वे कौन-से बोर्ड पढ़ाते हैं — CBSE, ICSE और UP Board (State Board) — और आपका मैच उन्हीं ट्यूटर्स से होता है जो आपका बोर्ड और क्लास पढ़ाते हैं, Nursery से Class 12 तक।",
    },
    {
      question: `मैं ${place} में टीचर हूँ। Home tuition के स्टूडेंट्स कैसे मिलेंगे?`,
      answer: `ट्यूटर के तौर पर फ्री registration करें, अपनी प्रोफ़ाइल में सब्जेक्ट, क्लास और पढ़ाने की लोकेशन भरें, और verification के लिए apply करें। Verified होने के बाद ${place} में आपके 10 किमी के अंदर की स्टूडेंट requests की खबर आपको मिलती है — बिना किसी लिस्टिंग फीस या कमीशन के।`,
    },
    {
      question: "क्या ऑनलाइन ट्यूशन भी मिलती है?",
      answer: "हाँ। Requirement डालते समय ऑनलाइन, या घर पर और ऑनलाइन दोनों चुनें — ऑनलाइन पढ़ाने वाले ट्यूटर कहीं से भी apply कर सकते हैं।",
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
  const hindiPlace = locality?.hindi ?? "सोनभद्र";
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
            Home Tuition in {shortPlace} – {hindiPlace} में घर पर ट्यूशन
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
            {hindiPlace} में होम ट्यूशन चाहिए? अपनी ज़रूरत बताइए — क्लास, बोर्ड, सब्जेक्ट और बजट — और 10 किमी के
            अंदर के Verified ट्यूटर आपसे संपर्क करेंगे।
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
      <FaqSection items={faqs} subtitle={`${hindiPlace} में home tuition से जुड़े आम सवाल।`} />
    </>
  );
}
