"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface Section {
  id: string;
  label: string;
}

/**
 * In-page navigation for the profile: a sticky list on desktop, a scrollable chip row on mobile. The section
 * nearest the top of the viewport is highlighted as you scroll.
 */
export function SectionNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const elements = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    if (!elements.length) return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        // The first section (in page order) that is on screen.
        const first = sections.find((s) => visible.has(s.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-10% 0px -55% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Profile sections" className="lg:sticky lg:top-6 lg:self-start">
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            <a
              href={`#${section.id}`}
              onClick={() => setActive(section.id)}
              aria-current={active === section.id ? "true" : undefined}
              className={cn(
                "block rounded-full border px-4 py-2 text-sm font-medium transition-colors lg:rounded-xl lg:border-0 lg:border-l-2 lg:py-2.5",
                active === section.id
                  ? "border-brand-secondary bg-brand-secondary-light text-brand-primary lg:border-brand-secondary"
                  : "border-border text-text-secondary hover:text-brand-primary lg:border-transparent lg:hover:bg-surface",
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
