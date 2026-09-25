import { Container } from "@/components/ui/Container";

export interface FaqItem {
  question: string;
  answer: string;
}

export const STUDENT_FAQS: FaqItem[] = [
  {
    question: "How do I find a suitable tutor?",
    answer:
      "Create a free student account and add your requirement — class, subject, board, budget, schedule and whether you want home or online tuition. We then show you verified tutors near your area who match it.",
  },
  {
    question: "Are your tutors verified and safe?",
    answer:
      "Yes. Every tutor profile goes through ID and qualification checks before it appears in search, so you know exactly who is teaching you.",
  },
  {
    question: "Can I take a demo class before confirming?",
    answer:
      "Many tutors offer a demo class. You can ask for one when you connect with a tutor, and decide only once you are comfortable with their teaching style.",
  },
  {
    question: "What subjects and classes do you cover?",
    answer:
      "Tutors on NexTutorHub teach from Nursery to Class 12 across CBSE, ICSE and State Boards, plus undergraduate subjects and competitive exam preparation.",
  },
  {
    question: "What happens if I am not satisfied with my tutor?",
    answer:
      "You are never locked in. You can go back to your matches at any time and connect with a different tutor who suits you better.",
  },
  {
    question: "Is my home address shared with tutors?",
    answer:
      "No. Discovery works by area and distance, not your exact address. You decide when and with whom to share precise details.",
  },
  {
    question: "What are the fees?",
    answer:
      "Each tutor sets their own fee. You can filter tutors by your budget and discuss the final fee and payment terms directly with the tutor.",
  },
  {
    question: "Do you offer both online and home tuition?",
    answer:
      "Yes. Choose home tuition, online tuition or both when you add your requirement, and we will show tutors who teach in that mode.",
  },
];

export const TUTOR_FAQS: FaqItem[] = [
  {
    question: "How do I become a tutor on NexTutorHub?",
    answer:
      "Create a free tutor account, then complete your profile with your subjects, classes, boards, qualifications, experience, teaching area and fees. Once verified, your profile appears in student searches nearby.",
  },
  {
    question: "Why do I need to be verified?",
    answer:
      "Students and families choose verified tutors with more confidence. ID and qualification checks mark your profile as trusted and help you get more responses.",
  },
  {
    question: "Can I choose where and how I teach?",
    answer:
      "Yes. Set your city, area and travel radius for home tuition, mark yourself available online, or both. You only appear in searches that match your setup.",
  },
  {
    question: "Who decides my fees?",
    answer: "You do. Set your monthly fee and availability on your profile and update them whenever you like.",
  },
  {
    question: "Is my exact address shown to students?",
    answer:
      "No. Students see your area and distance, never your exact address. You decide what to share once you connect.",
  },
  {
    question: "Can I teach more than one subject or class?",
    answer:
      "Yes. Add every subject, class and board you are comfortable teaching, and you will be matched with students across all of them.",
  },
];

interface FaqSectionProps {
  items?: FaqItem[];
  subtitle?: string;
}

/** Shared FAQ accordion. Defaults to student questions; pass `TUTOR_FAQS` on tutor-facing pages. */
export function FaqSection({
  items = STUDENT_FAQS,
  subtitle = "Everything you need to know before finding your tutor.",
}: FaqSectionProps) {
  return (
    <section className="bg-surface py-20">
      <Container className="max-w-4xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">FAQ</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-brand-primary sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-text-secondary">{subtitle}</p>
        </div>

        <div className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((faq) => (
            // A shared `name` makes the group an exclusive accordion: opening one closes the others.
            <details key={faq.question} name="faq" className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-base font-medium text-text-primary transition-colors hover:text-brand-secondary focus-ring [&::-webkit-details-marker]:hidden">
                {faq.question}
                <PlusIcon />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="shrink-0 transition-transform duration-200 group-open:rotate-45"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
