"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { tutorProfileApi } from "@/lib/api/profile";
import { tuitionApplicationsApi } from "@/lib/api/tuition-applications";
import type { TuitionApplication, TuitionApplicationStatus, TutorProfile } from "@/types/api";
import { ApiError } from "@/lib/api-client";
import { assetUrl } from "@/lib/config";

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

const APPLICATION_STATUS: Record<
  TuitionApplicationStatus,
  { label: string; variant: "success" | "warning" | "error" | "info"; description: string }
> = {
  pending: {
    label: "Under review",
    variant: "warning",
    description: "Our team is reviewing your application. We'll contact you soon.",
  },
  reviewed: {
    label: "Reviewed",
    variant: "info",
    description: "Your application has been reviewed. Our team will reach out with next steps.",
  },
  approved: {
    label: "Approved",
    variant: "success",
    description: "Congratulations! Your application is approved.",
  },
  rejected: {
    label: "Not approved",
    variant: "error",
    description: "Your application wasn't approved this time. You can update your details and apply again.",
  },
};

const MODE_LABEL: Record<TuitionApplication["tuitionMode"], string> = {
  home: "Home Tuition",
  online: "Online Tuition",
  other: "Other",
};

export default function TutorOverviewPage() {
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<TuitionApplication[] | null>(null);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  useEffect(() => {
    tuitionApplicationsApi
      .listMine()
      .then((res) => setApplications(res.items))
      .catch((err) => {
        setApplications([]);
        setApplicationsError(err instanceof ApiError ? err.message : "Failed to load your applications.");
      });
  }, []);

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

      <ApplicationCard applications={applications} error={applicationsError} />

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

function ApplicationCard({ applications, error }: { applications: TuitionApplication[] | null; error: string | null }) {
  if (applications === null) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-text-secondary">Loading your application…</p>
        </CardBody>
      </Card>
    );
  }

  const [latest, ...previous] = applications;

  if (!latest) {
    return (
      <Card>
        <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Tuition application</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {error ?? "You haven't applied yet. Submit your details and resume to start getting tuition."}
            </p>
          </div>
          <Button href="/for-tutors#apply">Apply for tuition</Button>
        </CardBody>
      </Card>
    );
  }

  const status = APPLICATION_STATUS[latest.status] ?? APPLICATION_STATUS.pending;
  const resumeHref = assetUrl(latest.resumeUrl);

  return (
    <Card>
      <CardBody className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Your tuition application</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Submitted on {formatDate(latest.createdAt)} · {status.description}
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {latest.adminNote && (
          <div className="rounded-xl border border-border bg-bg px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Note from our team</p>
            <p className="mt-1 text-text-primary">{latest.adminNote}</p>
          </div>
        )}

        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Full name" value={latest.fullName} />
          <Detail label="Mobile number" value={latest.mobileNumber} />
          <Detail label="Email" value={latest.email} />
          <Detail label="Related to" value={MODE_LABEL[latest.tuitionMode]} />
          <Detail label="Colony / Area" value={latest.area} />
          <Detail label="City" value={latest.city} />
          <Detail label="Full address" value={latest.fullAddress} className="sm:col-span-2" />
          <div className="min-w-0">
            <dt className="text-xs text-text-secondary">Resume</dt>
            <dd className="mt-0.5 truncate font-medium">
              {resumeHref ? (
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-secondary hover:text-brand-primary"
                  title={latest.resumeOriginalName}
                >
                  {latest.resumeOriginalName}
                </a>
              ) : (
                latest.resumeOriginalName
              )}
            </dd>
          </div>
        </dl>

        {latest.status === "rejected" && (
          <Button href="/for-tutors#apply" className="w-fit" variant="outline">
            Apply again
          </Button>
        )}

        {previous.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-text-primary">Earlier applications</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {previous.map((application) => {
                const s = APPLICATION_STATUS[application.status] ?? APPLICATION_STATUS.pending;
                return (
                  <li key={application._id} className="flex items-center justify-between gap-3">
                    <span className="text-text-secondary">
                      {formatDate(application.createdAt)} · {MODE_LABEL[application.tuitionMode]} · {application.city}
                    </span>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Detail({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
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
