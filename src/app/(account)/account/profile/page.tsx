"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { UserRole, type StudentProfile, type TutorProfile, type TutorResume } from "@/types/api";
import { StudentProfileForm } from "@/components/account/StudentProfileForm";
import { TutorProfileForm } from "@/components/account/TutorProfileForm";
import { ResumeLibrary } from "@/components/account/ResumeLibrary";
import { ProfileHeader } from "@/components/account/profile/ProfileHeader";
import { ContactDetailsCard, SecurityCard } from "@/components/account/profile/AccountCards";
import { SectionNav, type Section } from "@/components/account/profile/SectionNav";
import { Button } from "@/components/ui/Button";
import { studentProfileApi, tutorProfileApi } from "@/lib/api/profile";
import { ApiError } from "@/lib/api-client";
import { studentCompletion, tutorCompletion } from "@/lib/profile-completion";

const TUTOR_SECTIONS: Section[] = [
  { id: "overview", label: "Overview" },
  { id: "contact", label: "Contact details" },
  { id: "personal", label: "Personal details" },
  { id: "location", label: "Teaching location" },
  { id: "teaching", label: "Subjects & experience" },
  { id: "availability", label: "Time slots" },
  { id: "resume", label: "Resume" },
  { id: "security", label: "Password & security" },
];

const STUDENT_SECTIONS: Section[] = [
  { id: "overview", label: "Overview" },
  { id: "contact", label: "Contact details" },
  { id: "personal", label: "Personal details" },
  { id: "location", label: "Location" },
  { id: "learning", label: "Learning requirement" },
  { id: "guardian", label: "Guardian details" },
  { id: "security", label: "Password & security" },
];

const ADMIN_SECTIONS: Section[] = [
  { id: "overview", label: "Overview" },
  { id: "contact", label: "Contact details" },
  { id: "security", label: "Password & security" },
];

type LoadedProfile = { role: UserRole.TUTOR; item: TutorProfile } | { role: UserRole.STUDENT; item: StudentProfile };

export default function ProfilePage() {
  const { user } = useAuth();
  const role = user?.role;
  const [profile, setProfile] = useState<LoadedProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const hasProfile = role === UserRole.TUTOR || role === UserRole.STUDENT;

  useEffect(() => {
    if (!hasProfile) return;
    let cancelled = false;
    const request =
      role === UserRole.TUTOR
        ? tutorProfileApi.getMine().then((res) => ({ role: UserRole.TUTOR as const, item: res.item }))
        : studentProfileApi.getMine().then((res) => ({ role: UserRole.STUDENT as const, item: res.item }));
    request
      .then((loaded) => !cancelled && setProfile(loaded))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Failed to load your profile."));
    return () => {
      cancelled = true;
    };
  }, [role, hasProfile, attempt]);

  const completion = useMemo(() => {
    if (!profile) return null;
    return profile.role === UserRole.TUTOR ? tutorCompletion(profile.item) : studentCompletion(profile.item);
  }, [profile]);

  const setPhoto = useCallback((path: string | undefined) => {
    setProfile((current) =>
      current ? ({ ...current, item: { ...current.item, userId: { ...current.item.userId, profilePicture: path } } } as LoadedProfile) : current,
    );
  }, []);

  const setResumes = useCallback((resumes: TutorResume[]) => {
    setProfile((current) =>
      current?.role === UserRole.TUTOR ? { ...current, item: { ...current.item, resumes } } : current,
    );
  }, []);

  if (!user) return null;

  if (hasProfile && error)
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-error">{error}</p>
        <Button
          variant="outline"
          pill={false}
          onClick={() => {
            setError(null);
            setAttempt((n) => n + 1);
          }}
        >
          Try again
        </Button>
      </div>
    );

  if (hasProfile && !profile) return <ProfileSkeleton />;

  const tutor = profile?.role === UserRole.TUTOR ? profile.item : null;
  const student = profile?.role === UserRole.STUDENT ? profile.item : null;
  const sections = tutor ? TUTOR_SECTIONS : student ? STUDENT_SECTIONS : ADMIN_SECTIONS;
  const place = profile ? [profile.item.area, profile.item.city].filter(Boolean).join(", ") : "";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <ProfileHeader
        completion={completion}
        verificationStatus={tutor?.verificationStatus}
        locationLabel={place || undefined}
        onPhotoChange={setPhoto}
      />

      {tutor && tutor.verificationStatus !== "verified" && <VerificationNotice profile={tutor} />}

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <SectionNav sections={sections} />
        <div className="flex min-w-0 flex-col gap-6">
          <ContactDetailsCard />
          {tutor && (
            <TutorProfileForm
              profile={tutor}
              onSaved={(item) => setProfile({ role: UserRole.TUTOR, item: { ...item, resumes: tutor.resumes } })}
            />
          )}
          {student && (
            // StudentProfileForm reads ?setup= via useSearchParams, which needs a Suspense boundary.
            <Suspense fallback={null}>
              <StudentProfileForm profile={student} onSaved={(item) => setProfile({ role: UserRole.STUDENT, item })} />
            </Suspense>
          )}
          {tutor && <ResumeLibrary onChange={setResumes} />}
          <SecurityCard />
        </div>
      </div>
    </div>
  );
}

function VerificationNotice({ profile }: { profile: TutorProfile }) {
  const rejected = profile.verificationStatus === "rejected";
  return (
    <div
      role="status"
      className={
        rejected
          ? "rounded-2xl border border-error/30 bg-error/5 px-5 py-4"
          : "rounded-2xl border border-warning/30 bg-warning/5 px-5 py-4"
      }
    >
      <p className={rejected ? "text-sm font-semibold text-error" : "text-sm font-semibold text-warning"}>
        {rejected ? "Your verification was not approved" : "Your profile is awaiting verification"}
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        {rejected
          ? profile.verificationNote
            ? `Reason: ${profile.verificationNote}. Update your details and apply again.`
            : "Update your details and apply again."
          : "Only verified tutors are notified about nearby student requests and can apply to them. Complete your profile and resume to speed up the review."}
      </p>
      {rejected && (
        <Button href="/for-tutors#apply" size="sm" variant="outline" pill={false} className="mt-3">
          Apply again
        </Button>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl animate-pulse flex-col gap-6" aria-busy="true" aria-label="Loading your profile">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="h-28 bg-border/60 sm:h-32" />
        <div className="flex items-end gap-4 px-8 pb-6">
          <div className="-mt-12 h-24 w-24 rounded-full bg-border ring-4 ring-surface sm:h-28 sm:w-28" />
          <div className="flex flex-col gap-2 pb-2">
            <div className="h-5 w-48 rounded bg-border" />
            <div className="h-4 w-64 rounded bg-border/70" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="hidden flex-col gap-2 lg:flex">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-9 rounded-xl bg-border/60" />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-48 rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
