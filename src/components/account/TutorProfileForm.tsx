"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { isValidName, VALIDATION_MESSAGES } from "@/lib/validation";
import { Select } from "@/components/ui/Select";
import { AvailabilityPicker, availabilityError } from "@/components/ui/AvailabilityPicker";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { notify } from "@/components/ui/Toast";
import { SaveBar } from "@/components/account/profile/SaveBar";
import { tutorProfileApi, type UpdateTutorProfilePayload } from "@/lib/api/profile";
import { TUITION_MODE_OPTIONS, TEACHING_LANGUAGES } from "@/lib/constants";
import { useCatalog } from "@/hooks/useCatalog";
import { ApiError } from "@/lib/api-client";
import type { TutorProfile } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { LocationPicker } from "@/components/location/LocationPicker";
import { NEARBY_RADIUS_KM, toPickedLocation } from "@/lib/geolocation";

type FormState = UpdateTutorProfilePayload;

function toFormState(profile: TutorProfile): FormState {
  return {
    fullName: profile.userId.fullName ?? "",
    dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? "",
    gender: profile.gender ?? "",
    city: profile.city ?? "",
    area: profile.area ?? "",
    address: profile.address ?? "",
    pincode: profile.pincode ?? "",
    teachingExperienceYears: profile.teachingExperienceYears,
    highestQualification: profile.highestQualification ?? "",
    qualificationDetails: profile.qualificationDetails ?? "",
    bio: profile.bio ?? "",
    languages: profile.languages ?? [],
    subjects: profile.subjects ?? [],
    classes: profile.classes ?? [],
    boards: profile.boards ?? [],
    teachingMode: profile.teachingMode,
    fees: profile.fees,
    availabilitySlots: profile.availabilitySlots ?? [],
    location: toPickedLocation(profile.location, profile.locationMeta),
  };
}

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

interface TutorProfileFormProps {
  profile: TutorProfile;
  onSaved: (profile: TutorProfile) => void;
}

export function TutorProfileForm({ profile, onSaved }: TutorProfileFormProps) {
  const catalog = useCatalog();
  const { refreshUser } = useAuth();
  const [saved, setSaved] = useState<FormState>(() => toFormState(profile));
  const [form, setForm] = useState<FormState>(saved);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Free-text availability saved before time slots existed; shown so the tutor can re-enter it as slots.
  const [legacyAvailability, setLegacyAvailability] = useState<string | undefined>(() =>
    profile.availabilitySlots?.length ? undefined : profile.availability || undefined,
  );
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidName(form.fullName ?? "")) return setError(`Full name: ${VALIDATION_MESSAGES.name}`);
    const slotError = availabilityError(form.availabilitySlots ?? []);
    if (slotError) return setError(slotError);
    if (!form.location) return setError("Please set where you provide home tuition before saving your profile.");
    setIsSaving(true);
    try {
      // An empty slot list clears availability server-side; don't let it wipe old free text the tutor
      // hasn't converted to slots yet.
      const { availabilitySlots, ...rest } = form;
      const keepLegacy = !availabilitySlots?.length && !!legacyAvailability;
      const res = await tutorProfileApi.updateMine(keepLegacy ? rest : form);
      const next = toFormState(res.item);
      setSaved(next);
      setForm(next);
      if (res.item.availabilitySlots?.length) setLegacyAvailability(undefined);
      onSaved(res.item);
      if (form.fullName !== saved.fullName) await refreshUser();
      notify.success(res.message, "Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <Card id="personal" className="scroll-mt-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Personal details</h2>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-3">
          <Input label="Full name" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          <Input
            label="Date of birth"
            optional
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
          />
          <Select
            label="Gender"
            optional
            placeholder="Select gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          />
        </CardBody>
      </Card>

      <Card id="location" className="scroll-mt-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Where you teach</h2>
          <p className="mt-0.5 text-sm text-text-secondary">
            For home tuition you&rsquo;re matched with — and notified about — students within {NEARBY_RADIUS_KM} km of
            this location.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="City" optional value={form.city} onChange={(e) => update("city", e.target.value)} />
            <Input label="Area / locality" optional value={form.area} onChange={(e) => update("area", e.target.value)} />
            <Input
              label="Pincode"
              optional
              inputMode="numeric"
              maxLength={6}
              value={form.pincode}
              onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="Full address"
              optional
              placeholder="House no., street, landmark"
              containerClassName="sm:col-span-2"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              hint="Never shown publicly."
            />
            <Select
              label="Teaching mode"
              optional
              placeholder="Select mode"
              options={TUITION_MODE_OPTIONS}
              value={form.teachingMode ?? ""}
              onChange={(e) => update("teachingMode", e.target.value as FormState["teachingMode"])}
            />
          </div>
          <LocationPicker
            title="Where can you provide home tuition?"
            required
            value={form.location}
            onChange={(location) => update("location", location)}
          />
        </CardBody>
      </Card>

      <Card id="teaching" className="scroll-mt-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Subjects &amp; experience</h2>
          <p className="mt-0.5 text-sm text-text-secondary">Students filter by these, so keep them accurate.</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="Years of experience"
              optional
              type="number"
              min={0}
              value={form.teachingExperienceYears ?? ""}
              onChange={(e) =>
                update("teachingExperienceYears", e.target.value === "" ? undefined : Number(e.target.value))
              }
            />
            <Select
              label="Highest qualification"
              optional
              placeholder="Select qualification"
              options={catalog.qualifications.map((q) => ({ value: q, label: q }))}
              value={form.highestQualification}
              onChange={(e) => update("highestQualification", e.target.value)}
            />
            <Input
              label="Monthly fees (₹)"
              optional
              type="number"
              min={0}
              value={form.fees ?? ""}
              onChange={(e) => update("fees", e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </div>

          <Input
            label="Qualification details"
            optional
            placeholder="e.g. B.Sc. Mathematics — VBSPU, 2019; B.Ed."
            maxLength={200}
            hint="Degree, subject, college / university and year. Shown to students."
            value={form.qualificationDetails ?? ""}
            onChange={(e) => update("qualificationDetails", e.target.value)}
          />
          <Textarea
            label="About you"
            optional
            rows={4}
            maxLength={1000}
            placeholder="How you teach, your results, what students can expect in a class…"
            hint="Shown on your profile. A good introduction helps students choose you."
            value={form.bio ?? ""}
            onChange={(e) => update("bio", e.target.value)}
          />
          <MultiSelectChips
            label="Languages you teach in"
            optional
            options={TEACHING_LANGUAGES}
            value={form.languages ?? []}
            onChange={(v) => update("languages", v)}
          />
          <MultiSelectChips
            label="Subjects you teach"
            optional
            options={catalog.subjects}
            value={form.subjects ?? []}
            onChange={(v) => update("subjects", v)}
          />
          <MultiSelectChips
            label="Classes you teach"
            optional
            options={catalog.classes}
            value={form.classes ?? []}
            onChange={(v) => update("classes", v)}
          />
          <MultiSelectChips
            label="Boards you're familiar with"
            optional
            options={catalog.boards}
            value={form.boards ?? []}
            onChange={(v) => update("boards", v)}
          />
        </CardBody>
      </Card>

      <Card id="availability" className="scroll-mt-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Time slots</h2>
          <p className="mt-0.5 text-sm text-text-secondary">When you&apos;re free to teach each week.</p>
        </CardHeader>
        <CardBody>
          <AvailabilityPicker
            optional
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

      <SaveBar isDirty={isDirty} isSaving={isSaving} error={error} onDiscard={() => setForm(saved)} />
    </form>
  );
}
