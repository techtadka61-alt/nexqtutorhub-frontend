"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { studentProfileApi } from "@/lib/api/profile";
import type { StudentProfile } from "@/types/api";
import { ApiError } from "@/lib/api-client";

const FIELDS: (keyof StudentProfile)[] = [
  "city",
  "area",
  "studentClass",
  "board",
  "subjects",
  "preferredTuitionMode",
  "budget",
];

function completionPercent(profile: StudentProfile | null): number {
  if (!profile) return 0;
  const filled = FIELDS.filter((key) => {
    const value = profile[key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "";
  });
  return Math.round((filled.length / FIELDS.length) * 100);
}

export default function StudentOverviewPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentProfileApi
      .getMine()
      .then((res) => setProfile(res.item))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your profile."))
      .finally(() => setIsLoading(false));
  }, []);

  const completion = completionPercent(profile);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-primary">Your learning space</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Keep your requirement up to date so tutors nearby can find and reach out to you.
        </p>
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
                ? "Your requirement is fully set up. Tutors can now match against it accurately."
                : "Add your class, board, subjects, budget and preferred mode to help tutors find you."}
            </p>
            <Button href="/account/profile" className="w-fit" variant="outline">
              {completion === 100 ? "Edit requirement" : "Complete your requirement"}
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
                <Row label="Class" value={profile.studentClass} />
                <Row label="Board" value={profile.board} />
                <Row
                  label="Mode"
                  value={profile.preferredTuitionMode ? capitalize(profile.preferredTuitionMode) : undefined}
                />
                <Row label="Budget" value={profile.budget ? `₹${profile.budget}/mo` : undefined} />
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
            <h2 className="text-base font-semibold text-text-primary">Looking for a tutor?</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Browse verified tutors near you, filtered by subject, class and budget.
            </p>
          </div>
          <Button href="/how-it-works" variant="secondary">
            See how matching works
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
