import type { ReactNode } from "react";
import Link from "next/link";
import { FaqSection, GENERAL_FAQS } from "@/components/marketing/FaqSection";
import { Container } from "@/components/ui/Container";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/constants";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/** Shared layout for the Terms of Service and Privacy Policy: title, effective date, contents list, sections. */
export function LegalPage({
  eyebrow,
  title,
  intro,
  effectiveDate,
  sections,
  related,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  effectiveDate: string;
  sections: LegalSection[];
  related: { href: string; label: string };
}) {
  return (
    <>
      <section className="bg-bg py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[260px_1fr] lg:items-start">
          <nav aria-label="On this page" className="hidden rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-28 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">On this page</p>
            <ol className="mt-3 flex flex-col gap-2 text-sm">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-text-secondary transition-colors hover:text-brand-secondary">
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">{eyebrow}</span>
            <h1 className="mt-2 font-display text-3xl font-bold text-brand-primary sm:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-text-secondary">Effective date: {effectiveDate}</p>
            <div className="mt-6 text-[15px] leading-7 text-text-secondary">{intro}</div>

            <div className="mt-10 flex flex-col gap-10">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="font-display text-xl font-bold text-brand-primary">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="mt-3 flex flex-col gap-3 text-[15px] leading-7 text-text-secondary">{section.body}</div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-xl bg-brand-secondary-light/60 px-5 py-4 text-sm text-brand-primary">
              Questions about this document? Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline underline-offset-2">
                {SUPPORT_EMAIL}
              </a>{" "}
              or call{" "}
              <a href={`tel:${SUPPORT_PHONE_HREF}`} className="font-semibold underline underline-offset-2">
                {SUPPORT_PHONE}
              </a>
              . See also our{" "}
              <Link href={related.href} className="font-semibold underline underline-offset-2">
                {related.label}
              </Link>
              .
            </div>
          </article>
        </Container>
      </section>
      <FaqSection items={GENERAL_FAQS} subtitle="NexTutorHub इस्तेमाल करने से जुड़े आम सवाल।" />
    </>
  );
}

/** A bulleted list styled for the legal pages. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-brand-secondary">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
