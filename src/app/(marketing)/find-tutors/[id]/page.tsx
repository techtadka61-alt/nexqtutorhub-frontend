"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { describeTiming } from "@/components/ui/TimingPicker";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ApiError } from "@/lib/api-client";
import { studentProfileApi } from "@/lib/api/profile";
import { tutorsApi } from "@/lib/api/tutors";
import { assetUrl } from "@/lib/config";
import { cn } from "@/lib/cn";
import { NEARBY_RADIUS_KM } from "@/lib/geolocation";
import { useSavedTutors } from "@/lib/saved-tutors";
import { compatibility, initials, tutorTagline } from "@/lib/tutor-match";
import type { StudentProfile, TutorDetail } from "@/types/api";

const MODE_LABEL = { home: "Home tuition", online: "Online tuition", both: "Home & online tuition" } as const;

const monthYear = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : undefined;
const fullDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : undefined;

/** "9876543210" -> "+91 98765 43210" and the digits for tel: / WhatsApp links. */
function phone(number: string) {
  const digits = number.replace(/\D/g, "").slice(-10);
  return { display: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`, intl: `91${digits}` };
}

/**
 * A tutor's profile for a signed-in student: who they are, why they can be trusted (verification, member since,
 * qualification), what and when they teach, how far away they are, and — for verified tutors — how to contact them.
 * The tutor's address, exact location, resume and email are never shown.
 */
export default function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<TutorDetail | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isSaved, toggle } = useSavedTutors();

  useEffect(() => {
    tutorsApi
      .details(id)
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
      <Container className="flex max-w-5xl flex-col gap-6">
        <Link href="/find-tutors" className="w-fit text-sm font-semibold text-brand-secondary hover:text-brand-primary">
          ← Back to matched tutors
        </Link>

        {error ? (
          <div className="rounded-2xl border border-error/30 bg-error/5 px-5 py-4 text-sm text-error">{error}</div>
        ) : !tutor ? (
          <div className="h-80 animate-pulse rounded-3xl border border-border bg-surface" />
        ) : (
          <>
            <Header tutor={tutor} tagline={tutorTagline(tutor, student?.subjects)} score={score} saved={isSaved(tutor.id)} onSave={() => toggle(tutor.id)} />

            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
              <div className="flex flex-col gap-6">
                <Panel title="About">
                  {tutor.bio ? (
                    <p className="whitespace-pre-line text-[15px] leading-7 text-text-primary">{tutor.bio}</p>
                  ) : (
                    <p className="text-sm text-text-secondary">This tutor hasn&apos;t written an introduction yet.</p>
                  )}
                </Panel>

                <Panel title="Education & experience">
                  <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    <Fact label="Highest qualification" value={tutor.qualification} />
                    <Fact
                      label="Teaching experience"
                      value={
                        tutor.experienceYears
                          ? `${tutor.experienceYears} year${tutor.experienceYears === 1 ? "" : "s"}`
                          : tutor.experienceYears === 0
                            ? "Less than a year"
                            : undefined
                      }
                    />
                    <Fact label="Qualification details" value={tutor.qualificationDetails} className="sm:col-span-2" />
                    <Fact label="Teaches in" value={tutor.languages.length ? tutor.languages.join(", ") : undefined} />
                    {tutor.gender && tutor.gender !== "Prefer not to say" && <Fact label="Gender" value={tutor.gender} />}
                  </dl>
                </Panel>

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
                </div>
                <Panel title="Boards">
                  <ChipList items={tutor.boards} highlight={student?.board ? [student.board] : []} empty="Boards not added yet" />
                </Panel>

                <Panel title="Where & when">
                  <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    <Fact label="Mode" value={tutor.teachingMode ? MODE_LABEL[tutor.teachingMode] : undefined} />
                    <Fact label="Area" value={[tutor.area, tutor.city].filter(Boolean).join(", ") || undefined} />
                    <Fact
                      label="Distance from you"
                      value={
                        tutor.distanceKm !== undefined
                          ? `${tutor.distanceKm} km (approx.)`
                          : tutor.teachingMode === "online"
                            ? "Teaches online"
                            : "Set your location to see the distance"
                      }
                    />
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-text-secondary">Weekly timings</dt>
                      <dd className="mt-1 flex flex-col gap-1 text-sm font-medium text-text-primary">
                        {tutor.availabilitySlots.length
                          ? tutor.availabilitySlots.map((slot, index) => <span key={index}>🕒 {describeTiming(slot)}</span>)
                          : tutor.availability || <span className="font-normal text-text-secondary">Ask the tutor</span>}
                      </dd>
                    </div>
                  </dl>
                </Panel>
              </div>

              <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
                <ContactCard tutor={tutor} />
                <TrustCard tutor={tutor} />
              </aside>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

function Header({
  tutor,
  tagline,
  score,
  saved,
  onSave,
}: {
  tutor: TutorDetail;
  tagline: string;
  score: number | null;
  saved: boolean;
  onSave: () => void;
}) {
  const photo = assetUrl(tutor.profilePhoto);
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-start sm:p-8">
      <div className="relative w-fit shrink-0">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded or Google photo
          <img src={photo} alt={`${tutor.name ?? "Tutor"}'s photo`} className="h-28 w-28 rounded-3xl object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-secondary-light font-display text-4xl font-bold text-brand-primary">
            {initials(tutor.name)}
          </span>
        )}
        {tutor.isVerified && (
          <span
            title="Verified by NexTutorHub"
            className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-surface bg-success text-white"
          >
            <ShieldIcon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">{tutor.name ?? "Tutor"}</h1>
          {tutor.isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success-strong">
              <ShieldIcon className="h-3.5 w-3.5" /> Verified tutor
            </span>
          ) : (
            <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning-strong">Verification pending</span>
          )}
          {score !== null && (
            <span className="rounded-full bg-brand-secondary-light px-3 py-1 text-xs font-bold text-brand-primary">
              {score}% match for you
            </span>
          )}
        </div>
        <p className="text-text-secondary">{tagline}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Stat>★ {tutor.rating ? `${tutor.rating.toFixed(1)} rating` : "New tutor"}</Stat>
          {!!tutor.experienceYears && <Stat>🎓 {tutor.experienceYears} yrs experience</Stat>}
          {tutor.qualification && <Stat>📜 {tutor.qualification}</Stat>}
          {tutor.distanceKm !== undefined && <Stat>📍 {tutor.distanceKm} km away</Stat>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <div className="sm:text-right">
          <p className="text-2xl font-bold text-text-primary">
            {tutor.feeRange ? `₹${tutor.feeRange.toLocaleString("en-IN")}` : "Fee on request"}
          </p>
          {tutor.feeRange ? <p className="text-xs text-text-secondary">per month</p> : null}
        </div>
        <button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          className={cn(
            "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            saved ? "border-brand-secondary bg-brand-secondary-light text-brand-primary" : "border-border text-text-primary hover:border-brand-secondary",
          )}
        >
          {saved ? "Saved" : "Save tutor"}
        </button>
      </div>
    </div>
  );
}

function ContactCard({ tutor }: { tutor: TutorDetail }) {
  if (!tutor.contactNumber)
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Contact</h2>
        <p className="text-sm text-text-secondary">
          Our team is still verifying this tutor. Their contact number will appear here once they&apos;re verified.
        </p>
      </div>
    );
  const number = phone(tutor.contactNumber);
  const firstName = (tutor.name ?? "").split(" ")[0];
  const whatsappText = encodeURIComponent(
    `Hi ${firstName}, I found your profile on NexTutorHub and I'm interested in tuition. Are you available?`,
  );
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-secondary/30 bg-brand-secondary-light/40 p-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Contact {firstName || "tutor"}</h2>
        <p className="mt-1 font-display text-2xl font-bold text-brand-primary">{number.display}</p>
      </div>
      <div className="flex flex-col gap-2">
        <a
          href={`tel:+${number.intl}`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-primary text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
        >
          <PhoneIcon /> Call now
        </a>
        <a
          href={`https://wa.me/${number.intl}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#25D366] bg-surface text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/10"
        >
          <WhatsAppIcon /> Message on WhatsApp
        </a>
      </div>
      <p className="text-xs leading-5 text-text-secondary">
        Safety tip: ask for a demo class first, and have a parent present for the first few sessions at home.
      </p>
    </div>
  );
}

function TrustCard({ tutor }: { tutor: TutorDetail }) {
  const items = [
    tutor.isVerified
      ? { ok: true, text: `ID & qualification checked by NexTutorHub${tutor.verifiedAt ? ` on ${fullDate(tutor.verifiedAt)}` : ""}` }
      : { ok: false, text: "Verification by our team is in progress" },
    ...(tutor.memberSince ? [{ ok: true, text: `On NexTutorHub since ${monthYear(tutor.memberSince)}` }] : []),
    ...(tutor.qualification ? [{ ok: true, text: `Qualification: ${tutor.qualification}` }] : []),
    { ok: true, text: `Home address kept private — matched within ${NEARBY_RADIUS_KM} km by distance only` },
  ];
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Why you can trust this tutor</h2>
      <ul className="flex flex-col gap-2.5 text-sm">
        {items.map((item) => (
          <li key={item.text} className="flex gap-2.5">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                item.ok ? "bg-success/15 text-success-strong" : "bg-warning/15 text-warning-strong",
              )}
            >
              {item.ok ? "✓" : "…"}
            </span>
            <span className="text-text-primary">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-bg px-3 py-1 text-text-secondary">{children}</span>;
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

function Fact({ label, value, className }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd className={cn("mt-1 text-sm font-medium", value ? "text-text-primary" : "font-normal text-text-secondary")}>
        {value || "Not added yet"}
      </dd>
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.6a1 1 0 01-.25 1l-2.2 2.2Z" />
    </svg>
  );
}
