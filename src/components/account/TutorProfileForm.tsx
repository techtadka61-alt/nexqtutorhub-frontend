"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AvailabilityPicker, availabilityError } from "@/components/ui/AvailabilityPicker";
import { Button } from "@/components/ui/Button";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { tutorProfileApi, type UpdateTutorProfilePayload } from "@/lib/api/profile";
import { BOARD_OPTIONS, CLASS_OPTIONS, QUALIFICATION_OPTIONS, SUBJECT_OPTIONS, TUITION_MODE_OPTIONS } from "@/lib/constants";
import { ApiError } from "@/lib/api-client";
import type { TutorProfile } from "@/types/api";
import { useRouter } from "next/navigation";
import { roleHomePath, useAuth } from "@/context/auth-context";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { ResumeLibrary } from "@/components/account/ResumeLibrary";

type FormState = UpdateTutorProfilePayload;

function toFormState(profile: TutorProfile | null, fallbackName?: string): FormState {
  return {
    fullName: profile?.userId.fullName ?? fallbackName ?? "",
    dateOfBirth: profile?.dateOfBirth?.slice(0, 10) ?? "",
    gender: profile?.gender ?? "",
    city: profile?.city ?? "",
    area: profile?.area ?? "",
    address: profile?.address ?? "",
    pincode: profile?.pincode ?? "",
    teachingExperienceYears: profile?.teachingExperienceYears,
    highestQualification: profile?.highestQualification ?? "",
    subjects: profile?.subjects ?? [],
    classes: profile?.classes ?? [],
    boards: profile?.boards ?? [],
    teachingMode: profile?.teachingMode,
    preferredRadiusKm: profile?.preferredRadiusKm,
    fees: profile?.fees,
    availabilitySlots: profile?.availabilitySlots ?? [],
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
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  // Free-text availability saved before time slots existed; shown so the tutor can re-enter it as slots.
  const [legacyAvailability, setLegacyAvailability] = useState<string | undefined>();

  useEffect(() => {
    tutorProfileApi
      .getMine()
      .then((res) => {
        setForm(toFormState(res.item));
        if (!res.item.availabilitySlots?.length) setLegacyAvailability(res.item.availability || undefined);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your profile."))
      .finally(() => setIsLoading(false));
  }, []);

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
    const slotError = availabilityError(form.availabilitySlots ?? []);
    if (slotError) return setError(slotError);
    setIsSaving(true);
    try {
      // An empty slot list clears availability server-side; don't let it wipe old free text the tutor
      // hasn't converted to slots yet.
      const { availabilitySlots, ...rest } = form;
      const keepLegacy = !availabilitySlots?.length && !!legacyAvailability;
      const res = await tutorProfileApi.updateMine(keepLegacy ? rest : form);
      setForm(toFormState(res.item));
      if (res.item.availabilitySlots?.length) setLegacyAvailability(undefined);
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
      <SuccessModal
        open={success}
        title="Profile updated"
        description="Your changes have been saved successfully."
        confirmLabel="Go to dashboard"
        onConfirm={() => {
          setSuccess(false);
          if (user) router.push(roleHomePath(user.role));
        }}
      />

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
          <Input
            label="Full address"
            placeholder="House no., street, landmark"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            hint="Pre-filled from your tuition application, if you submitted one."
          />
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

      <ResumeLibrary />

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

          <AvailabilityPicker
            hint={
              legacyAvailability
                ? `Previously saved as: “${legacyAvailability}”. Add it as time slots below.`
                : "Pick the days and hours you're free to teach. Add more slots for different timings."
            }
            value={form.availabilitySlots ?? []}
            onChange={(slots) => update("availabilitySlots", slots)}
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
