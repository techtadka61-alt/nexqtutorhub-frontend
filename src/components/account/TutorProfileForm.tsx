"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { tutorProfileApi, tutorResumeApi, type UpdateTutorProfilePayload } from "@/lib/api/profile";
import { BOARD_OPTIONS, CLASS_OPTIONS, QUALIFICATION_OPTIONS, SUBJECT_OPTIONS, TUITION_MODE_OPTIONS } from "@/lib/constants";
import { ApiError } from "@/lib/api-client";
import { assetUrl } from "@/lib/config";
import type { TutorProfile } from "@/types/api";
import { useAuth } from "@/context/auth-context";

const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_RESUME_SIZE_MB = 5;

type FormState = UpdateTutorProfilePayload;

function toFormState(profile: TutorProfile | null, fallbackName?: string): FormState {
  return {
    fullName: profile?.userId.fullName ?? fallbackName ?? "",
    dateOfBirth: profile?.dateOfBirth?.slice(0, 10) ?? "",
    gender: profile?.gender ?? "",
    city: profile?.city ?? "",
    area: profile?.area ?? "",
    pincode: profile?.pincode ?? "",
    teachingExperienceYears: profile?.teachingExperienceYears,
    highestQualification: profile?.highestQualification ?? "",
    subjects: profile?.subjects ?? [],
    classes: profile?.classes ?? [],
    boards: profile?.boards ?? [],
    teachingMode: profile?.teachingMode,
    preferredRadiusKm: profile?.preferredRadiusKm,
    fees: profile?.fees,
    availability: profile?.availability ?? "",
  };
}

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export function TutorProfileForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(toFormState(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [resumeUrl, setResumeUrl] = useState<string | undefined>();
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  useEffect(() => {
    tutorProfileApi
      .getMine()
      .then((res) => {
        setForm(toFormState(res.item));
        setResumeUrl(res.item.resumeUrl);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your profile."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleResumeSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setResumeError(null);

    if (!ALLOWED_RESUME_TYPES.has(file.type)) {
      setResumeError("Please upload a PDF or Word document (.pdf, .doc, .docx).");
      return;
    }
    if (file.size > MAX_RESUME_SIZE_MB * 1024 * 1024) {
      setResumeError(`File is too large. Maximum size is ${MAX_RESUME_SIZE_MB}MB.`);
      return;
    }

    setIsUploadingResume(true);
    try {
      const res = await tutorResumeApi.upload(file);
      setResumeUrl(res.item.resumeUrl);
    } catch (err) {
      setResumeError(err instanceof ApiError ? err.message : "Failed to upload your CV. Please try again.");
    } finally {
      setIsUploadingResume(false);
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        update("location", { lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("done");
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const res = await tutorProfileApi.updateMine(form);
      setForm(toFormState(res.item));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-text-secondary">Loading your profile…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          Your profile has been updated.
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Basic details</h2>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Input label="Full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          <Input label="Email" value={user?.email ?? ""} disabled hint="Contact support to change your email." />
          <Input
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
          />
          <Select
            label="Gender"
            placeholder="Select gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Where you teach</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <p className="text-sm text-text-secondary">
            Tell us your city and area, and how far you&rsquo;re willing to travel for home tuition. This
            also powers &ldquo;tutors near me&rdquo; search for students.
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
            <Input label="Area / locality" value={form.area} onChange={(e) => update("area", e.target.value)} />
            <Input label="Pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Teaching mode"
              placeholder="Select mode"
              options={TUITION_MODE_OPTIONS}
              value={form.teachingMode ?? ""}
              onChange={(e) => update("teachingMode", e.target.value as FormState["teachingMode"])}
              hint="Home tuition, online tuition, or both."
            />
            <Input
              label="Travel radius for home tuition (km)"
              type="number"
              min={0}
              value={form.preferredRadiusKm ?? ""}
              onChange={(e) =>
                update("preferredRadiusKm", e.target.value === "" ? undefined : Number(e.target.value))
              }
              hint="Maximum distance you can travel from your area."
            />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Precise location</p>
              <p className="text-xs text-text-secondary">
                {form.location
                  ? `Captured (${form.location.lat.toFixed(4)}, ${form.location.lng.toFixed(4)})`
                  : "Used only for distance-based matching — never shown publicly."}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={captureLocation} isLoading={locationStatus === "locating"}>
              {form.location ? "Update location" : "Share my location"}
            </Button>
          </div>
          {locationStatus === "error" && (
            <p className="text-xs text-error">
              Couldn&rsquo;t access your location. Please allow location access in your browser and try again.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">CV / resume</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            Upload your CV so families can review your teaching background. PDF or Word, up to{" "}
            {MAX_RESUME_SIZE_MB}MB.
          </p>

          {resumeError && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
              {resumeError}
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary-light text-brand-primary">
                <FileIcon />
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {resumeUrl ? "CV uploaded" : "No CV uploaded yet"}
                </p>
                {resumeUrl && (
                  <a
                    href={assetUrl(resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-brand-secondary hover:text-brand-primary"
                  >
                    View current CV
                  </a>
                )}
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-brand-secondary hover:text-brand-secondary">
              {isUploadingResume ? "Uploading…" : resumeUrl ? "Replace CV" : "Upload CV"}
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                disabled={isUploadingResume}
                onChange={handleResumeSelect}
              />
            </label>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Teaching profile</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="Years of experience"
              type="number"
              min={0}
              value={form.teachingExperienceYears ?? ""}
              onChange={(e) =>
                update("teachingExperienceYears", e.target.value === "" ? undefined : Number(e.target.value))
              }
            />
            <Select
              label="Highest qualification"
              placeholder="Select qualification"
              options={QUALIFICATION_OPTIONS.map((q) => ({ value: q, label: q }))}
              value={form.highestQualification}
              onChange={(e) => update("highestQualification", e.target.value)}
            />
            <Input
              label="Monthly fees (₹)"
              type="number"
              min={0}
              value={form.fees ?? ""}
              onChange={(e) => update("fees", e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </div>

          <MultiSelectChips
            label="Subjects you teach"
            options={SUBJECT_OPTIONS}
            value={form.subjects ?? []}
            onChange={(v) => update("subjects", v)}
          />
          <MultiSelectChips
            label="Classes you teach"
            options={CLASS_OPTIONS}
            value={form.classes ?? []}
            onChange={(v) => update("classes", v)}
          />
          <MultiSelectChips
            label="Boards you're familiar with"
            options={BOARD_OPTIONS}
            value={form.boards ?? []}
            onChange={(v) => update("boards", v)}
          />

          <Textarea
            label="Availability"
            placeholder="e.g. Weekdays 4–8 PM, weekends flexible"
            value={form.availability}
            onChange={(e) => update("availability", e.target.value)}
          />
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" isLoading={isSaving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 3v5a1 1 0 001 1h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 21a2 2 0 01-2-2V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6Z" strokeLinejoin="round" />
    </svg>
  );
}
