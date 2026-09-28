"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ApiError } from "@/lib/api-client";
import { studentProfileApi } from "@/lib/api/profile";
import { tutorsApi } from "@/lib/api/tutors";
import { assetUrl } from "@/lib/config";
import { cn } from "@/lib/cn";
import { useSavedTutors } from "@/lib/saved-tutors";
import { compatibility, initials, tutorTagline } from "@/lib/tutor-match";
import type { StudentProfile, TutorSearchResult } from "@/types/api";

const MODE_LABEL = { home: "Home tuition", online: "Online tuition", both: "Home & online tuition" } as const;

/** Public (guest-safe) tutor profile, opened from the student's matched-tutor listing. */
export default function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<TutorSearchResult | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isSaved, toggle } = useSavedTutors();

  useEffect(() => {
    tutorsApi
      .guestProfile(id)
      .then((res) => setTutor(res.item))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this tutor."));
    studentProfileApi
      .getMine()
      .then((res) => setStudent(res.item))
      .catch(() => undefined);
  }, [id]);

  const score =
    tutor && student
      ? compatibility(tutor, {
          subjects: student.subjects ?? [],
          studentClass: student.studentClass,
          board: student.board,
          mode:
            student.preferredTuitionMode === "home" || student.preferredTuitionMode === "online"
              ? student.preferredTuitionMode
              : "any",
          city: student.city,
          area: student.area,
          maxFee: student.budget,
        })
      : null;

  return (
    <section className="bg-bg py-10 sm:py-14">
      <Container className="flex max-w-4xl flex-col gap-6">
        <Link href="/find-tutors" className="w-fit text-sm font-semibold text-brand-secondary hover:text-brand-primary">
          ← Back to matched tutors
        </Link>

        {error ? (
          <div className="rounded-2xl border border-error/30 bg-error/5 px-5 py-4 text-sm text-error">{error}</div>
        ) : !tutor ? (
          <div className="h-80 animate-pulse rounded-3xl border border-border bg-surface" />
        ) : (
          <>
            <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-start sm:p-8">
              {assetUrl(tutor.profilePhoto) ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo served by the API origin
                <img src={assetUrl(tutor.profilePhoto)} alt="" className="h-24 w-24 shrink-0 rounded-3xl object-cover" />
              ) : (
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-brand-secondary-light font-display text-3xl font-bold text-brand-primary">
                  {initials(tutor.name)}
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h1 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">{tutor.name ?? "Tutor"}</h1>
                  {tutor.isVerified && (
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Verified</span>
                  )}
                  {score !== null && (
                    <span className="rounded-full bg-brand-secondary-light px-3 py-1 text-xs font-bold text-brand-primary">
                      {score}% compatibility
                    </span>
                  )}
                </div>
                <p className="text-text-secondary">{tutorTagline(tutor, student?.subjects)}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-secondary">
                  <span>★ {tutor.rating ? `${tutor.rating.toFixed(1)} rating` : "New tutor"}</span>
                  {!!tutor.experienceYears && <span>{tutor.experienceYears} years experience</span>}
                  {tutor.qualification && <span>{tutor.qualification}</span>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                <p className="text-2xl font-bold text-text-primary">
                  {tutor.feeRange ? `₹${tutor.feeRange.toLocaleString("en-IN")}/mo` : "Fee on request"}
                </p>
                <button
                  type="button"
                  onClick={() => toggle(tutor.id)}
                  aria-pressed={isSaved(tutor.id)}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isSaved(tutor.id)
                      ? "border-brand-secondary bg-brand-secondary-light text-brand-primary"
                      : "border-border text-text-primary hover:border-brand-secondary",
                  )}
                >
                  {isSaved(tutor.id) ? "Saved" : "Save tutor"}
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Panel title="Teaches">
                <ChipList items={tutor.subjects} highlight={student?.subjects} empty="Subjects not added yet" />
              </Panel>
              <Panel title="Classes">
                <ChipList
                  items={tutor.classes}
                  highlight={student?.studentClass ? [student.studentClass] : []}
                  empty="Classes not added yet"
                />
              </Panel>
              <Panel title="Boards">
                <ChipList items={tutor.boards} highlight={student?.board ? [student.board] : []} empty="Boards not added yet" />
              </Panel>
              <Panel title="Where & how">
                <dl className="flex flex-col gap-2 text-sm">
                  <Fact label="Mode" value={tutor.teachingMode ? MODE_LABEL[tutor.teachingMode] : undefined} />
                  <Fact
                    label="Location"
                    value={
                      [tutor.area, tutor.city].filter(Boolean).join(", ") +
                        (tutor.distanceKm !== undefined ? ` · ${tutor.distanceKm} km away` : "") || undefined
                    }
                  />
                  <Fact label="Available" value={tutor.availability} />
                </dl>
              </Panel>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">{title}</h2>
      {children}
    </div>
  );
}

function ChipList({ items, highlight = [], empty }: { items?: string[]; highlight?: string[]; empty: string }) {
  if (!items?.length) return <p className="text-sm text-text-secondary">{empty}</p>;
  const wanted = new Set(highlight.map((h) => h.toLowerCase()));
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "rounded-lg px-2.5 py-1 text-sm font-medium",
            wanted.has(item.toLowerCase()) ? "bg-brand-secondary-light text-brand-primary" : "bg-bg text-text-secondary",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-text-secondary">{label}</dt>
      <dd className="min-w-0 text-text-primary">{value || "—"}</dd>
    </div>
  );
}
