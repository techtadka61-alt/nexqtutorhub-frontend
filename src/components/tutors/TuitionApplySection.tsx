"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { tutorProfileApi, tutorResumeApi } from "@/lib/api/profile";
import { tuitionApplicationsApi } from "@/lib/api/tuition-applications";
import { cn } from "@/lib/cn";
import { assetUrl } from "@/lib/config";
import { UserRole, type TuitionApplication, type TuitionApplicationMode, type TutorResume } from "@/types/api";

const NEW_RESUME = "new";

const MODE_OPTIONS: { value: TuitionApplicationMode; label: string }[] = [
  { value: "home", label: "Home Tuition" },
  { value: "online", label: "Online Tuition" },
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

type Access = "loading" | "guest" | "not-tutor" | "tutor";

/**
 * "Apply for tuition" on the For Tutors page. The form is always visible, but only a signed-in tutor can
 * submit it: guests are asked to register (which sends the verification email) or sign in — tutor sign-in
 * lands back here — and non-tutor accounts are told to use a tutor account. The API enforces the same rule.
 */
export function TuitionApplyPanel() {
  const { user, isLoading } = useAuth();
  const isTutor = user?.role === UserRole.TUTOR;
  const [applications, setApplications] = useState<TuitionApplication[] | null>(null);

  useEffect(() => {
    if (!isTutor) return;
    tuitionApplicationsApi
      .listMine()
      .then((res) => setApplications(res.items))
      .catch(() => setApplications([]));
  }, [isTutor, user?.id]);

  const access: Access = isLoading ? "loading" : !user ? "guest" : isTutor ? "tutor" : "not-tutor";
  if (access === "tutor" && applications === null) return <p className="text-sm text-text-secondary">Loading…</p>;

  const latest = isTutor ? applications?.[0] : undefined;
  return (
    <ApplyForm
      // Remount when the account changes so defaults are re-read from the signed-in user.
      key={user?.id ?? "guest"}
      access={access}
      defaults={{ fullName: user?.fullName ?? "", email: user?.email ?? "" }}
      latest={latest}
      onSubmitted={(application) => setApplications((prev) => [application, ...(prev ?? [])])}
    />
  );
}

function ApplyForm({
  access,
  defaults,
  latest,
  onSubmitted,
}: {
  access: Access;
  defaults: { fullName: string; email: string };
  latest?: TuitionApplication;
  onSubmitted: (application: TuitionApplication) => void;
}) {
  const isPending = latest?.status === "pending";
  const [form, setForm] = useState<FormState>({
    fullName: latest?.fullName ?? defaults.fullName,
    mobileNumber: latest?.mobileNumber ?? "",
    email: latest?.email ?? defaults.email,
    tuitionMode: latest?.tuitionMode ?? "",
    fullAddress: latest?.fullAddress ?? "",
    area: latest?.area ?? "",
    city: latest?.city ?? "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [savedResumes, setSavedResumes] = useState<TutorResume[]>([]);
  // A saved resume's id, or NEW_RESUME to upload a new file. One resume per application either way.
  const [resumeChoice, setResumeChoice] = useState<string>(NEW_RESUME);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fill blanks from the tutor's account/profile (mobile isn't in the auth payload; address etc. may have been
  // saved on the profile), and load their saved resumes, preselecting the newest.
  useEffect(() => {
    if (access !== "tutor") return;
    tutorProfileApi
      .getMine()
      .then(({ item }) => {
        const mode = item?.teachingMode === "home" || item?.teachingMode === "online" ? item.teachingMode : "";
        setForm((prev) => ({
          ...prev,
          mobileNumber: prev.mobileNumber || item?.userId?.mobileNumber || "",
          fullAddress: prev.fullAddress || item?.address || "",
          area: prev.area || item?.area || "",
          city: prev.city || item?.city || "",
          tuitionMode: prev.tuitionMode || mode,
        }));
      })
      .catch(() => undefined);
    tutorResumeApi
      .list()
      .then((res) => {
        setSavedResumes(res.items);
        if (res.items[0]) setResumeChoice((prev) => (prev === NEW_RESUME ? res.items[0]._id : prev));
      })
      .catch(() => undefined);
  }, [access]);

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
    if (access === "loading") return;
    if (access === "guest") return setError("Please register as a tutor or sign in before applying.");
    if (access === "not-tutor")
      return setError("You're signed in with a student account. Please use a tutor account to apply.");
    if (isPending) return setError("Your application is already under review.");
    if (!form.tuitionMode) return setError("Please choose what your tuition is related to.");
    const useNewUpload = resumeChoice === NEW_RESUME;
    if (useNewUpload && !resume) return setError("Please upload your resume or choose one of your saved resumes.");

    setIsSubmitting(true);
    try {
      const res = await tuitionApplicationsApi.apply({
        ...form,
        tuitionMode: form.tuitionMode,
        ...(useNewUpload ? { resume: resume as File } : { resumeId: resumeChoice }),
      });
      setResume(null);
      onSubmitted(res.application);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-primary">Tutor application</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {latest && !isPending
            ? `Your last application was ${latest.status}. You can submit a new one below.`
            : "Fill in your details and upload your resume. Our team will review it and get in touch."}
        </p>
      </div>

      {isPending && latest && <PendingNotice application={latest} />}

      {error && (
        <div role="alert" className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
          {access === "guest" && (
            <span className="mt-1 block">
              <Link href="/signup/tutor" className="font-semibold underline underline-offset-2">
                Register as Tutor
              </Link>{" "}
              or{" "}
              <Link href="/login" className="font-semibold underline underline-offset-2">
                Sign in
              </Link>
            </span>
          )}
        </div>
      )}

      <fieldset disabled={isPending || isSubmitting} className="flex flex-col gap-5 disabled:opacity-70">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
            required
            minLength={2}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          <Input
            label="Mobile Number"
            placeholder="10-digit mobile number"
            type="tel"
            autoComplete="tel"
            required
            value={form.mobileNumber}
            onChange={(e) => update("mobileNumber", e.target.value)}
          />
        </div>

        <Input
          label="Email Address"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />

        <fieldset>
          <legend className="text-sm font-medium text-text-primary">Related to</legend>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {MODE_OPTIONS.map((option) => {
              const checked = form.tuitionMode === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-secondary/40",
                    checked
                      ? "border-brand-secondary bg-brand-secondary-light/60 text-brand-primary"
                      : "border-border bg-surface text-text-secondary hover:border-brand-secondary/60",
                  )}
                >
                  <input
                    type="radio"
                    name="tuitionMode"
                    value={option.value}
                    required
                    checked={checked}
                    onChange={() => update("tuitionMode", option.value)}
                    className="h-4 w-4 accent-brand-secondary"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-text-primary">Resume</legend>
          {isPending && latest ? (
            <ResumeOption checked label={latest.resumeOriginalName} hint="Sent with this application" />
          ) : (
            <>
              {savedResumes.length > 0 && (
                <p className="mt-1 text-xs text-text-secondary">
                  Choose which CV to send with this application — only one is sent.
                </p>
              )}
              {savedResumes.map((saved, index) => (
                <ResumeOption
                  key={saved._id}
                  name="resumeChoice"
                  checked={resumeChoice === saved._id}
                  onSelect={() => setResumeChoice(saved._id)}
                  label={saved.originalName}
                  hint={`Saved ${formatDate(saved.uploadedAt)}${index === 0 ? " · Latest" : ""}`}
                  href={assetUrl(saved.url)}
                />
              ))}
              {savedResumes.length > 0 && (
                <ResumeOption
                  name="resumeChoice"
                  checked={resumeChoice === NEW_RESUME}
                  onSelect={() => setResumeChoice(NEW_RESUME)}
                  label="Upload a new resume"
                  hint="It will also be saved to your profile"
                />
              )}
              {resumeChoice === NEW_RESUME && (
                <>
                  <input
                    type="file"
                    accept={RESUME_ACCEPT}
                    className="sr-only"
                    id="resume-upload"
                    aria-label="Upload resume"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <label
                    htmlFor="resume-upload"
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-xl border border-dashed px-4 py-4 transition-colors hover:border-brand-secondary",
                      resume ? "border-brand-secondary bg-brand-secondary-light/40" : "border-border bg-surface",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary-light text-brand-primary">
                      <UploadIcon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-primary">
                        {resume ? resume.name : "Click to upload your resume"}
                      </span>
                      <span className="block text-xs text-text-secondary">PDF or Word · max {MAX_RESUME_MB} MB</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-brand-secondary">
                      {resume ? "Change" : "Browse"}
                    </span>
                  </label>
                </>
              )}
            </>
          )}
        </fieldset>

        <Input
          label="Full Address"
          placeholder="House no., street, landmark"
          autoComplete="street-address"
          required
          minLength={5}
          value={form.fullAddress}
          onChange={(e) => update("fullAddress", e.target.value)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Colony / Area"
            placeholder="e.g. Vijay Nagar"
            required
            minLength={2}
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
          />
          <Input
            label="City"
            placeholder="e.g. Indore"
            autoComplete="address-level2"
            required
            minLength={2}
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" pill={false} isLoading={isSubmitting} className="mt-1 sm:self-start sm:px-10">
          {isPending ? "Application under review" : "Submit Application"}
        </Button>
      </fieldset>

      {access === "guest" && (
        <p className="text-sm text-text-secondary">
          Not registered yet?{" "}
          <Link href="/signup/tutor" className="font-semibold text-brand-secondary hover:text-brand-primary">
            Register as a Tutor
          </Link>{" "}
          first — only registered, signed-in tutors can apply. Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-secondary hover:text-brand-primary">
            Sign in
          </Link>
          .
        </p>
      )}
      {access === "not-tutor" && (
        <p className="text-sm text-text-secondary">
          You&apos;re signed in with a student account. Applications need a{" "}
          <Link href="/signup/tutor" className="font-semibold text-brand-secondary hover:text-brand-primary">
            tutor account
          </Link>
          .
        </p>
      )}
      {access === "tutor" && (
        <p className="text-sm text-text-secondary">
          Your resume, address, area and city are also saved to your{" "}
          <Link href="/account/tutor" className="font-semibold text-brand-secondary hover:text-brand-primary">
            tutor profile
          </Link>
          .
        </p>
      )}
    </form>
  );
}

function PendingNotice({ application }: { application: TuitionApplication }) {
  const submittedOn = new Date(application.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" });
  return (
    <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-text-primary">
      <span className="mt-0.5 shrink-0 text-success">
        <CheckIcon />
      </span>
      <p>
        <span className="font-semibold">Application submitted on {submittedOn}</span> — it&apos;s under review.
        We&apos;ll contact you at {application.email} or {application.mobileNumber}.
      </p>
    </div>
  );
}

function ResumeOption({
  name,
  checked,
  onSelect,
  label,
  hint,
  href,
}: {
  name?: string;
  checked: boolean;
  onSelect?: () => void;
  label: string;
  hint: string;
  href?: string;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-secondary/40",
        onSelect && "cursor-pointer",
        checked
          ? "border-brand-secondary bg-brand-secondary-light/40"
          : "border-border bg-surface hover:border-brand-secondary/60",
      )}
    >
      {onSelect && (
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onSelect}
          className="h-4 w-4 shrink-0 accent-brand-secondary"
        />
      )}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-secondary-light text-brand-primary">
        <FileIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-text-primary" title={label}>
          {label}
        </span>
        <span className="block text-xs text-text-secondary">{hint}</span>
      </span>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-xs font-semibold text-brand-secondary hover:text-brand-primary"
        >
          View
        </a>
      )}
    </label>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 3v5a1 1 0 001 1h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 21a2 2 0 01-2-2V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6Z" strokeLinejoin="round" />
    </svg>
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

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
