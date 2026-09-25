"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { MultiSelectChips } from "@/components/ui/MultiSelectChips";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { studentProfileApi, type UpdateStudentProfilePayload } from "@/lib/api/profile";
import { BOARD_OPTIONS, CLASS_OPTIONS, SUBJECT_OPTIONS, TUITION_MODE_OPTIONS } from "@/lib/constants";
import { ApiError } from "@/lib/api-client";
import type { StudentProfile } from "@/types/api";
import { useAuth } from "@/context/auth-context";

type FormState = UpdateStudentProfilePayload;

function toFormState(profile: StudentProfile | null, fallbackName?: string): FormState {
  return {
    fullName: profile?.userId.fullName ?? fallbackName ?? "",
    dateOfBirth: profile?.dateOfBirth?.slice(0, 10) ?? "",
    city: profile?.city ?? "",
    area: profile?.area ?? "",
    pincode: profile?.pincode ?? "",
    studentClass: profile?.studentClass ?? "",
    board: profile?.board ?? "",
    subjects: profile?.subjects ?? [],
    preferredTuitionMode: profile?.preferredTuitionMode,
    budget: profile?.budget,
    availability: profile?.availability ?? "",
    guardianName: profile?.guardianName ?? "",
    guardianMobileNumber: profile?.guardianMobileNumber ?? "",
    guardianEmail: profile?.guardianEmail ?? "",
  };
}

export function StudentProfileForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(toFormState(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    studentProfileApi
      .getMine()
      .then((res) => setForm(toFormState(res.item)))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your profile."))
      .finally(() => setIsLoading(false));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const res = await studentProfileApi.updateMine(form);
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
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          <Input
            label="Email"
            value={user?.email ?? ""}
            disabled
            hint="Contact support to change your email."
          />
          <Input
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Location</h2>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-3">
          <Input label="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
          <Input label="Area / locality" value={form.area} onChange={(e) => update("area", e.target.value)} />
          <Input label="Pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Learning requirement</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Select
              label="Class"
              placeholder="Select class"
              options={CLASS_OPTIONS.map((c) => ({ value: c, label: c }))}
              value={form.studentClass}
              onChange={(e) => update("studentClass", e.target.value)}
            />
            <Select
              label="Board"
              placeholder="Select board"
              options={BOARD_OPTIONS.map((b) => ({ value: b, label: b }))}
              value={form.board}
              onChange={(e) => update("board", e.target.value)}
            />
            <Select
              label="Preferred tuition mode"
              placeholder="Select mode"
              options={TUITION_MODE_OPTIONS}
              value={form.preferredTuitionMode ?? ""}
              onChange={(e) => update("preferredTuitionMode", e.target.value as FormState["preferredTuitionMode"])}
            />
          </div>

          <MultiSelectChips
            label="Subjects you need help with"
            options={SUBJECT_OPTIONS}
            value={form.subjects ?? []}
            onChange={(v) => update("subjects", v)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Monthly budget (₹)"
              type="number"
              min={0}
              value={form.budget ?? ""}
              onChange={(e) => update("budget", e.target.value === "" ? undefined : Number(e.target.value))}
            />
            <Input
              label="Availability"
              placeholder="e.g. Weekday evenings, 5–7 PM"
              value={form.availability}
              onChange={(e) => update("availability", e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-text-primary">Guardian details</h2>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-3">
          <Input
            label="Guardian name"
            value={form.guardianName}
            onChange={(e) => update("guardianName", e.target.value)}
          />
          <Input
            label="Guardian mobile"
            type="tel"
            value={form.guardianMobileNumber}
            onChange={(e) => update("guardianMobileNumber", e.target.value)}
          />
          <Input
            label="Guardian email"
            type="email"
            value={form.guardianEmail}
            onChange={(e) => update("guardianEmail", e.target.value)}
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
