"use client";

import { Button } from "@/components/ui/Button";
import { assetUrl } from "@/lib/config";
import { cn } from "@/lib/cn";
import { useSavedTutors } from "@/lib/saved-tutors";
import { initials, tutorTagline } from "@/lib/tutor-match";
import type { TutorSearchResult } from "@/types/api";

/**
 * Listing row for one tutor: identity + fit on the left, price and actions on the right (stacked on mobile).
 * `wantedSubjects` highlights and front-loads the subjects the student asked for.
 */
export function TutorCard({
  tutor,
  compatibility,
  wantedSubjects,
}: {
  tutor: TutorSearchResult;
  compatibility: number | null;
  wantedSubjects: string[];
}) {
  const { isSaved, toggle } = useSavedTutors();
  const saved = isSaved(tutor.id);
  const photo = assetUrl(tutor.profilePhoto);
  const wanted = new Set(wantedSubjects.map((s) => s.toLowerCase()));
  const subjects = [...(tutor.subjects ?? [])].sort(
    (a, b) => Number(wanted.has(b.toLowerCase())) - Number(wanted.has(a.toLowerCase())),
  );
  const chips = [
    ...subjects.slice(0, 3).map((label) => ({ label, highlight: wanted.has(label.toLowerCase()) })),
    ...(tutor.classes ?? []).slice(0, 2).map((label) => ({ label, highlight: false })),
  ];
  const hiddenCount = subjects.length - Math.min(3, subjects.length) + Math.max(0, (tutor.classes?.length ?? 0) - 2);
  const place = tutor.area || tutor.city;
  const href = `/find-tutors/${tutor.id}`;

  return (
    <article className="relative flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-soft sm:flex-row sm:p-6">
      <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo served by the API origin
          <img src={photo} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-secondary-light font-display text-xl font-bold text-brand-primary">
            {initials(tutor.name)}
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pr-10 sm:pr-0">
            <h3 className="text-lg font-semibold text-text-primary">{tutor.name ?? "Tutor"}</h3>
            {tutor.isVerified && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                <CheckCircleIcon />
                Verified
              </span>
            )}
            {compatibility !== null && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  compatibility >= 80
                    ? "bg-success/10 text-success"
                    : compatibility >= 50
                      ? "bg-brand-secondary-light text-brand-primary"
                      : "bg-bg text-text-secondary",
                )}
              >
                {compatibility}% compatibility
              </span>
            )}
          </div>

          <p className="text-text-secondary">{tutorTagline(tutor, wantedSubjects)}</p>

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-sm font-medium",
                    chip.highlight ? "bg-brand-secondary-light text-brand-primary" : "bg-bg text-text-secondary",
                  )}
                >
                  {chip.label}
                </span>
              ))}
              {hiddenCount > 0 && (
                <span className="rounded-lg bg-bg px-2.5 py-1 text-sm font-medium text-text-secondary">+{hiddenCount}</span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-text-secondary">
            {tutor.qualification && <span>{tutor.qualification}</span>}
            {!!tutor.experienceYears && (
              <span>
                {tutor.experienceYears} year{tutor.experienceYears === 1 ? "" : "s"}
              </span>
            )}
            {place && (
              <span className="inline-flex items-center gap-1">
                <PinIcon />
                {place}
                {tutor.distanceKm !== undefined && ` · ${tutor.distanceKm} km`}
              </span>
            )}
            {tutor.teachingMode && (
              <span>{tutor.teachingMode === "both" ? "Home & online" : tutor.teachingMode === "home" ? "Home tuition" : "Online"}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:w-40 sm:flex-col sm:items-end sm:justify-between sm:border-0 sm:pt-0">
        <button
          type="button"
          onClick={() => toggle(tutor.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${tutor.name ?? "tutor"} from saved` : `Save ${tutor.name ?? "tutor"}`}
          className={cn(
            "absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors sm:static",
            saved ? "text-brand-secondary" : "text-text-primary hover:bg-bg",
          )}
        >
          <BookmarkIcon filled={saved} />
        </button>
        <div className="text-left sm:text-right">
          <p className="text-xl font-bold text-text-primary">
            {tutor.feeRange ? `₹${tutor.feeRange.toLocaleString("en-IN")}/mo` : "Fee on request"}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-text-secondary">
            <StarIcon />
            {tutor.rating ? tutor.rating.toFixed(1) : "New"}
          </p>
        </div>
        <Button href={href} size="sm" pill={false}>
          View profile
        </Button>
      </div>
    </article>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 4h12v16l-6-4-6 4V4Z" strokeLinejoin="round" />
    </svg>
  );
}
