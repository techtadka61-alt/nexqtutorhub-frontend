"use client";

import { useState } from "react";
import { TimingPicker, timingError } from "@/components/ui/TimingPicker";
import { Input } from "@/components/ui/Input";
import { MobileInput } from "@/components/ui/MobileInput";
import { isValidEmail, isValidMobile, isValidName, sanitizeMobile, VALIDATION_MESSAGES } from "@/lib/validation";
import { Select } from "@/components/ui/Select";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { notify } from "@/components/ui/Toast";
import { SaveBar } from "@/components/account/profile/SaveBar";
import { studentProfileApi, type UpdateStudentProfilePayload } from "@/lib/api/profile";
import { TUITION_MODE_OPTIONS } from "@/lib/constants";
import { useCatalog } from "@/hooks/useCatalog";
import { ApiError } from "@/lib/api-client";
import type { StudentProfile } from "@/types/api";
import { useRouter, useSearchParams } from "next/navigation";
import { missingRequirement } from "@/lib/student-requirement";
import { useAuth } from "@/context/auth-context";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { LocationPicker } from "@/components/location/LocationPicker";
import { NEARBY_RADIUS_KM, toPickedLocation } from "@/lib/geolocation";

type FormState = UpdateStudentProfilePayload;

function toFormState(profile: StudentProfile): FormState {
  return {
    fullName: profile.userId.fullName ?? "",
    dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? "",
    city: profile.city ?? "",
    area: profile.area ?? "",
    pincode: profile.pincode ?? "",
    studentClass: profile.studentClass ?? "",
    board: profile.board ?? "",
    subjects: profile.subjects ?? [],
    preferredTuitionMode: profile.preferredTuitionMode,
    budget: profile.budget,
    availability: profile.availability ?? "",
    guardianName: profile.guardianName ?? "",
    // Older records may hold "+91…"; the field (and the API) only take the 10 digits.
    guardianMobileNumber: sanitizeMobile(profile.guardianMobileNumber ?? ""),
    guardianEmail: profile.guardianEmail ?? "",
    location: toPickedLocation(profile.location, profile.locationMeta),
  };
}

interface StudentProfileFormProps {
  profile: StudentProfile;
  onSaved: (profile: StudentProfile) => void;
}

/** Profile details required on save beyond the matching requirement (missingRequirement). Returns field labels. */
function missingProfileDetails(form: FormState): string[] {
  const missing: string[] = [];
  if (!form.dateOfBirth) missing.push("date of birth");
  if (form.preferredTuitionMode !== "online" && !form.area?.trim()) missing.push("area / locality");
  if (!form.board) missing.push("board");
  if (!form.budget || form.budget <= 0) missing.push("monthly budget");
  if (!form.availability?.trim()) missing.push("preferred timing");
  return missing;
}

export function StudentProfileForm({ profile, onSaved }: StudentProfileFormProps) {
  const catalog = useCatalog();
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<FormState>(() => toFormState(profile));
  const [form, setForm] = useState<FormState>(saved);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showListingPrompt, setShowListingPrompt] = useState(false);
  // Guided first run (sent here after login because the requirement was missing): required fields are
  // enforced, and saving leads to the matched-tutor listing instead of staying here.
  const setupMode = useSearchParams().get("setup") === "requirement";
  const [requirementWasMissing] = useState(() => missingRequirement(profile).length > 0);
  const goToListing = setupMode || requirementWasMissing;
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidName(form.fullName ?? "")) return setError(`Full name: ${VALIDATION_MESSAGES.name}`);
    if (form.guardianName && !isValidName(form.guardianName)) return setError(`Guardian name: ${VALIDATION_MESSAGES.name}`);
    if (form.guardianMobileNumber && !isValidMobile(form.guardianMobileNumber))
      return setError(`Guardian mobile: ${VALIDATION_MESSAGES.mobile}`);
    if (form.guardianEmail && !isValidEmail(form.guardianEmail)) return setError(`Guardian email: ${VALIDATION_MESSAGES.email}`);
    if (!form.location) return setError("Please set where you need home tuition before saving your profile.");
    const timingProblem = timingError(form.availability ?? "");
    if (timingProblem) return setError(timingProblem);
    const missing = [...missingRequirement(form), ...missingProfileDetails(form)];
    if (missing.length)
      return setError(`Please add your ${missing.join(", ")} so we can match you with the right tutors.`);
    if (form.dateOfBirth && form.dateOfBirth > new Date().toISOString().slice(0, 10))
      return setError("Date of birth can't be in the future.");
    setIsSaving(true);
    try {
      const res = await studentProfileApi.updateMine(form);
      const next = toFormState(res.item);
      setSaved(next);
      setForm(next);
      onSaved(res.item);
      if (form.fullName !== saved.fullName) await refreshUser();
      if (goToListing) setShowListingPrompt(true);
      else notify.success(res.message, "Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {setupMode && (
        <div className="rounded-2xl border border-brand-secondary/30 bg-brand-secondary-light/40 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-brand-primary">Tell us what you need</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Add your class, subjects, preferred tuition mode and city. We&apos;ll use them to show tutors that match
            you — you can change them any time.
          </p>
        </div>
      )}
      <SuccessModal
        open={showListingPrompt}
        title="Requirement submitted"
        description="Great! We've found tutors that match your requirement."
        confirmLabel="See matched tutors"
        onConfirm={() => {
          setShowListingPrompt(false);
          router.push("/find-tutors");
        }}
      />

      <Card id="personal" className="scroll-mt-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Personal details</h2>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Input label="Full name" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          <Input
            label="Date of birth"
            required
            max={new Date().toISOString().slice(0, 10)}
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
          />
        </CardBody>
      </Card>

      <Card id="location" className="scroll-mt-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Location</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            Tutors within {NEARBY_RADIUS_KM} km of this point are shown to you. It is never shown to tutors.
          </p>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-3">
          <Input
            label="City"
            required={form.preferredTuitionMode !== "online"}
            optional={form.preferredTuitionMode === "online"}
            hint={form.preferredTuitionMode === "online" ? "Not needed for online-only tuition" : undefined}
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
          <Input
            label="Area / locality"
            required={form.preferredTuitionMode !== "online"}
            optional={form.preferredTuitionMode === "online"}
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
          />
          <Input
            label="Pincode"
            optional
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <LocationPicker
            title="Where do you need home tuition?"
            required
            className="sm:col-span-3"
            value={form.location}
            onChange={(location) => update("location", location)}
          />
        </CardBody>
      </Card>

      <Card id="learning" className="scroll-mt-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Learning requirement</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Select
              label="Class"
              required
              placeholder="Select class"
              options={catalog.classes.map((c) => ({ value: c, label: c }))}
              value={form.studentClass}
              onChange={(e) => update("studentClass", e.target.value)}
            />
            <Select
              label="Board"
              required
              placeholder="Select board"
              options={catalog.boards.map((b) => ({ value: b, label: b }))}
              value={form.board}
              onChange={(e) => update("board", e.target.value)}
            />
            <Select
              label="Preferred tuition mode"
              required
              placeholder="Select mode"
              options={TUITION_MODE_OPTIONS}
              value={form.preferredTuitionMode ?? ""}
              onChange={(e) => update("preferredTuitionMode", e.target.value as FormState["preferredTuitionMode"])}
            />
          </div>

          <MultiSelectChips
            label="Subjects you need help with"
            required
            hint="Pick at least one"
            options={catalog.subjects}
            value={form.subjects ?? []}
            onChange={(v) => update("subjects", v)}
          />

          <Input
            label="Monthly budget (₹)"
            required
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="e.g. 2000"
            containerClassName="sm:max-w-xs"
            value={form.budget ?? ""}
            onChange={(e) => update("budget", e.target.value === "" ? undefined : Number(e.target.value))}
          />
          <TimingPicker required value={form.availability ?? ""} onChange={(value) => update("availability", value)} />
        </CardBody>
      </Card>

      <Card id="guardian" className="scroll-mt-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Guardian details</h2>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-3">
          <Input label="Guardian name" optional value={form.guardianName} onChange={(e) => update("guardianName", e.target.value)} />
          <MobileInput
            label="Guardian mobile"
            optional
            placeholder="10-digit mobile number"
            value={form.guardianMobileNumber ?? ""}
            onValueChange={(value) => update("guardianMobileNumber", value)}
          />
          <Input
            label="Guardian email"
            optional
            type="email"
            value={form.guardianEmail}
            onChange={(e) => update("guardianEmail", e.target.value)}
          />
        </CardBody>
      </Card>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        error={error}
        onDiscard={() => setForm(saved)}
        submitLabel={goToListing ? "Submit requirement" : "Save changes"}
        alwaysEnabled={goToListing}
      />
    </form>
  );
}
