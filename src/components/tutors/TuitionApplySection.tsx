"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { tutorProfileApi } from "@/lib/api/profile";
import { tuitionApplicationsApi } from "@/lib/api/tuition-applications";
import { cn } from "@/lib/cn";
import { UserRole, type TuitionApplication, type TuitionApplicationMode } from "@/types/api";

const MODE_OPTIONS: { value: TuitionApplicationMode; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
];

const MAX_RESUME_MB = 5;
const RESUME_ACCEPT = ".pdf,.doc,.docx";
const RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

interface FormState {
  fullName: string;
  mobileNumber: string;
  email: string;
  tuitionMode: TuitionApplicationMode | "";
  fullAddress: string;
  area: string;
  city: string;
}

/**
 * "Apply for tuition" on the For Tutors page. Only a signed-in tutor sees the form; everyone else is
 * pointed to register (which sends the verification email) and then sign in, which lands them back here.
 */
export function TuitionApplyPanel() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PanelMessage title="Loading…" />;

  if (!user) {
    return (
      <PanelMessage
        title="Register as a tutor to apply"
        description="Create your tutor account and verify your email. Then sign in and you'll come straight back here to submit your application."
        actions={
          <>
            <Button href="/signup/tutor" pill={false} fullWidth>
              Register as Tutor
            </Button>
            <Button href="/login" variant="outline" pill={false} fullWidth>
              I already have an account
            </Button>
          </>
        }
      />
    );
  }

  if (user.role !== UserRole.TUTOR) {
    return (
      <PanelMessage
        title="Applications are for tutor accounts"
        description="You're signed in with a student account. Register a separate tutor account to apply for tuition."
        actions={
          <Button href="/signup/tutor" pill={false} fullWidth>
            Register as Tutor
          </Button>
        }
      />
    );
  }

  return <TutorApplication userId={user.id} fullName={user.fullName} email={user.email} />;
}

function TutorApplication({ userId, fullName, email }: { userId: string; fullName: string; email: string }) {
  const [applications, setApplications] = useState<TuitionApplication[] | null>(null);

  useEffect(() => {
    tuitionApplicationsApi
      .listMine()
      .then((res) => setApplications(res.items))
      .catch(() => setApplications([]));
  }, [userId]);

  if (applications === null) return <PanelMessage title="Loading…" />;

  const pending = applications.find((a) => a.status === "pending");
  if (pending) return <SubmittedCard application={pending} />;

  return (
    <ApplyForm
      defaults={{ fullName, email }}
      previous={applications[0]}
      onSubmitted={(application) => setApplications((prev) => [application, ...(prev ?? [])])}
    />
  );
}

function ApplyForm({
  defaults,
  previous,
  onSubmitted,
}: {
  defaults: { fullName: string; email: string };
  previous?: TuitionApplication;
  onSubmitted: (application: TuitionApplication) => void;
}) {
  const [form, setForm] = useState<FormState>({
    fullName: defaults.fullName,
    mobileNumber: "",
    email: defaults.email,
    tuitionMode: "",
    fullAddress: previous?.fullAddress ?? "",
    area: previous?.area ?? "",
    city: previous?.city ?? "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill the mobile number from the tutor's account (not part of the auth user payload).
  useEffect(() => {
    tutorProfileApi
      .getMine()
      .then((res) => {
        const mobile = res.item?.userId?.mobileNumber;
        if (mobile) setForm((prev) => (prev.mobileNumber ? prev : { ...prev, mobileNumber: mobile }));
      })
      .catch(() => undefined);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return setResume(null);
    if (!RESUME_TYPES.has(file.type)) {
      setError("Resume must be a PDF or Word document.");
      return setResume(null);
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      setError(`Resume must be ${MAX_RESUME_MB} MB or smaller.`);
      return setResume(null);
    }
    setResume(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.tuitionMode) return setError("Please choose what your tuition is related to.");
    if (!resume) return setError("Please upload your resume.");

    setIsSubmitting(true);
    try {
      const res = await tuitionApplicationsApi.apply({ ...form, tuitionMode: form.tuitionMode, resume });
      onSubmitted(res.application);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl font-bold text-brand-primary">Apply for tuition</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {previous
            ? `Your last application was ${previous.status}. You can submit a new one below.`
            : "Fill in your details and upload your resume. Our team will review it and get in touch."}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full Name"
          labelAsPlaceholder
          autoComplete="name"
          required
          minLength={2}
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
        />
        <Input
          label="Mobile Number"
          labelAsPlaceholder
          type="tel"
          autoComplete="tel"
          required
          value={form.mobileNumber}
          onChange={(e) => update("mobileNumber", e.target.value)}
        />
        <Input
          label="Email Address"
          labelAsPlaceholder
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <Select
          label="Related to"
          labelAsPlaceholder
          required
          options={MODE_OPTIONS}
          value={form.tuitionMode}
          onChange={(e) => update("tuitionMode", e.target.value as TuitionApplicationMode)}
        />
      </div>

      <div>
        <input
          type="file"
          accept={RESUME_ACCEPT}
          className="sr-only"
          id="resume-upload"
          aria-label="Upload Resume"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <label
          htmlFor="resume-upload"
          className={cn(
            "flex h-13 cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 text-sm transition-colors hover:border-brand-secondary",
            resume ? "border-brand-secondary bg-brand-secondary-light/40 text-text-primary" : "border-border text-text-secondary/70",
          )}
        >
          <UploadIcon />
          <span className="min-w-0 flex-1 truncate">{resume ? resume.name : "Upload Resume"}</span>
          <span className="shrink-0 text-xs text-text-secondary">PDF / Word · max {MAX_RESUME_MB} MB</span>
        </label>
      </div>

      <Input
        label="Full Address"
        labelAsPlaceholder
        autoComplete="street-address"
        required
        minLength={5}
        value={form.fullAddress}
        onChange={(e) => update("fullAddress", e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Colony / Area"
          labelAsPlaceholder
          required
          minLength={2}
          value={form.area}
          onChange={(e) => update("area", e.target.value)}
        />
        <Input
          label="City"
          labelAsPlaceholder
          autoComplete="address-level2"
          required
          minLength={2}
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" pill={false} isLoading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}

function SubmittedCard({ application }: { application: TuitionApplication }) {
  const submittedOn = new Date(application.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" });
  return (
    <PanelMessage
      tone="success"
      title="Application submitted"
      description={`We received your application on ${submittedOn} and it's under review. We'll contact you at ${application.email} or ${application.mobileNumber}.`}
      actions={
        <dl className="grid w-full grid-cols-2 gap-3 rounded-2xl bg-bg p-4 text-left text-sm">
          <Detail label="Related to" value={MODE_OPTIONS.find((m) => m.value === application.tuitionMode)?.label ?? ""} />
          <Detail label="City" value={application.city} />
          <Detail label="Area" value={application.area} />
          <Detail label="Resume" value={application.resumeOriginalName} />
        </dl>
      }
    />
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd className="truncate font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function PanelMessage({
  title,
  description,
  actions,
  tone = "brand",
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tone?: "brand" | "success";
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          tone === "success" ? "bg-success/10 text-success" : "bg-brand-secondary-light text-brand-primary",
        )}
      >
        {tone === "success" ? <CheckIcon /> : <ClipboardIcon />}
      </span>
      <div>
        <h3 className="font-display text-xl font-bold text-brand-primary">{title}</h3>
        {description && <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex w-full max-w-sm flex-col gap-3">{actions}</div>}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" strokeLinecap="round" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9zM9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
