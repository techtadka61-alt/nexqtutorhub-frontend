"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { tutorProfileApi } from "@/lib/api/profile";
import type { TutorProfile } from "@/types/api";
import { ApiError } from "@/lib/api-client";

const FIELDS: (keyof TutorProfile)[] = [
  "city",
  "area",
  "teachingExperienceYears",
  "highestQualification",
  "subjects",
  "classes",
  "teachingMode",
  "fees",
];

function completionPercent(profile: TutorProfile | null): number {
  if (!profile) return 0;
  const filled = FIELDS.filter((key) => {
    const value = profile[key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "";
  });
  return Math.round((filled.length / FIELDS.length) * 100);
}

const VERIFICATION_COPY: Record<string, { label: string; variant: "success" | "warning" | "error" }> = {
  verified: { label: "Verified", variant: "success" },
  pending: { label: "Verification pending", variant: "warning" },
  rejected: { label: "Verification rejected", variant: "error" },
};

export default function TutorOverviewPage() {
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tutorProfileApi
      .getMine()
      .then((res) => setProfile(res.item))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your profile."))
      .finally(() => setIsLoading(false));
  }, []);

  const completion = completionPercent(profile);
  const verification = profile ? VERIFICATION_COPY[profile.verificationStatus] ?? VERIFICATION_COPY.pending : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-primary">Your teaching profile</h1>
          <p className="mt-1 text-sm text-text-secondary">
            A complete, verified profile appears higher in student search results.
          </p>
        </div>
        {verification && <Badge variant={verification.variant}>{verification.label}</Badge>}
      </div>

      {error && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">Profile completeness</h2>
              <Badge variant={completion === 100 ? "success" : "mint"}>{completion}% complete</Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-brand-secondary transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-sm text-text-secondary">
              {completion === 100
                ? "Your teaching profile is fully set up and ready to be discovered by students."
                : "Add your subjects, classes, experience, fees and teaching area to start appearing in search."}
            </p>
            <Button href="/account/profile" className="w-fit" variant="outline">
              {completion === 100 ? "Edit profile" : "Complete your profile"}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-text-primary">Quick summary</h2>
            {isLoading ? (
              <p className="text-sm text-text-secondary">Loading…</p>
            ) : profile ? (
              <dl className="flex flex-col gap-3 text-sm">
                <Row label="City" value={profile.city} />
                <Row label="Experience" value={profile.teachingExperienceYears ? `${profile.teachingExperienceYears} yrs` : undefined} />
                <Row label="Mode" value={profile.teachingMode ? capitalize(profile.teachingMode) : undefined} />
                <Row label="Fees" value={profile.fees ? `₹${profile.fees}/mo` : undefined} />
                <Row label="Rating" value={profile.rating ? `${profile.rating.toFixed(1)} / 5` : "No ratings yet"} />
              </dl>
            ) : (
              <p className="text-sm text-text-secondary">No profile data yet.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Want more visibility?</h2>
            <p className="mt-1 text-sm text-text-secondary">
              A verified badge and a wider travel radius help you appear in more student searches.
            </p>
          </div>
          <Button href="/for-tutors" variant="secondary">
            See tutor benefits
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2.5 last:border-0 last:pb-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium text-text-primary">{value ?? <Link href="/account/profile" className="text-brand-secondary">Add</Link>}</dd>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
