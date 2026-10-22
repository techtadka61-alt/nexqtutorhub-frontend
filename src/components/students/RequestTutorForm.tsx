"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TimingPicker, timingError } from "@/components/ui/TimingPicker";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Input } from "@/components/ui/Input";
import { LocationPicker } from "@/components/location/LocationPicker";
import { MobileInput } from "@/components/ui/MobileInput";
import { isValidMobile, sanitizeMobile, VALIDATION_MESSAGES } from "@/lib/validation";
import { CreatableMultiSelect } from "@/components/ui/CreatableMultiSelect";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/context/auth-context";
import { notify } from "@/components/ui/Toast";
import { studentProfileApi } from "@/lib/api/profile";
import { tuitionRequestsApi, type TuitionRequestPayload } from "@/lib/api/tuition-requests";
import { cn } from "@/lib/cn";
import { TUITION_MODE_OPTIONS } from "@/lib/constants";
import { useCatalog } from "@/hooks/useCatalog";
import { NEARBY_RADIUS_KM, toPickedLocation } from "@/lib/geolocation";
import { requestDraft, type RequestDraft } from "@/lib/request-draft";
import { returnTo } from "@/lib/return-to";
import { UserRole, type StudentProfile, type TuitionRequest } from "@/types/api";

const PAGE_PATH = "/request-tutor";

const EMPTY: RequestDraft = {
  studentClass: "",
  board: "",
  subjects: [],
  tuitionMode: "",
  city: "",
  area: "",
  fullAddress: "",
  budget: "",
  schedule: "",
  notes: "",
  mobileNumber: "",
};

const STEPS = ["What to learn", "Where & how", "Final details"] as const;

type Access = "loading" | "guest" | "student" | "other";

/** Blank draft fields filled from the student's saved profile, so a returning student types less. */
function withProfileDefaults(draft: RequestDraft, profile: StudentProfile | null): RequestDraft {
  if (!profile) return draft;
  return {
    ...draft,
    studentClass: draft.studentClass || profile.studentClass || "",
    board: draft.board || profile.board || "",
    subjects: draft.subjects.length ? draft.subjects : profile.subjects ?? [],
    tuitionMode: draft.tuitionMode || profile.preferredTuitionMode || "",
    city: draft.city || profile.city || "",
    area: draft.area || profile.area || "",
    budget: draft.budget || (profile.budget ? String(profile.budget) : ""),
    mobileNumber: draft.mobileNumber || sanitizeMobile(profile.userId?.mobileNumber ?? ""),
    location: draft.location ?? toPickedLocation(profile.location, profile.locationMeta),
  };
}

function stepError(step: number, form: RequestDraft): string | null {
  if (step === 0) {
    if (!form.studentClass) return "Please choose the class.";
    if (!form.subjects.length) return "Please pick at least one subject.";
    if (!form.board) return "Please choose the board.";
  }
  if (step === 1) {
    if (!form.tuitionMode) return "Please choose how you'd like to study.";
    if (form.tuitionMode !== "online" && (form.city ?? "").trim().length < 2)
      return "Please enter your city so nearby tutors can find you.";
    if (form.tuitionMode !== "online" && (form.area ?? "").trim().length < 2)
      return "Please enter your colony / area.";
    if (form.tuitionMode !== "online" && !form.location)
      return `Please set where you need the tutor so tutors within ${NEARBY_RADIUS_KM} km can see your request.`;
  }
  if (step === 2) {
    if (!isValidMobile(form.mobileNumber)) return VALIDATION_MESSAGES.mobile;
    if (!form.budget || !(Number(form.budget) > 0)) return "Please enter your monthly budget.";
    if (!form.schedule?.trim()) return "Please choose your preferred days and time.";
    const timingProblem = timingError(form.schedule ?? "");
    if (timingProblem) return timingProblem;
  }
  return null;
}

function toPayload(form: RequestDraft): TuitionRequestPayload {
  const optional = (value?: string) => value?.trim() || undefined;
  const online = form.tuitionMode === "online";
  return {
    studentClass: form.studentClass,
    board: optional(form.board),
    subjects: form.subjects,
    tuitionMode: form.tuitionMode as TuitionRequestPayload["tuitionMode"],
    city: optional(form.city),
    area: optional(form.area),
    // A home address means nothing to an online-only tutor; don't collect it.
    fullAddress: online ? undefined : optional(form.fullAddress),
    budget: form.budget ? Math.round(Number(form.budget)) : undefined,
    schedule: optional(form.schedule),
    notes: optional(form.notes),
    mobileNumber: form.mobileNumber,
    location: form.location,
  };
}

/**
 * "Find a tutor" requirement form on the public site. Anyone can fill it; on submit a guest is asked to create
 * an account or sign in, and their answers are kept and posted automatically once they come back signed in.
 */
export function RequestTutorForm() {
  const catalog = useCatalog();
  const { user, isLoading } = useAuth();
  const access: Access = isLoading ? "loading" : !user ? "guest" : user.role === UserRole.STUDENT ? "student" : "other";

  const [form, setForm] = useState<RequestDraft>(EMPTY);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsAccount, setNeedsAccount] = useState(false);
  const [posted, setPosted] = useState<TuitionRequest | null>(null);
  const autoSubmitted = useRef(false);

  // Restore a saved draft (a guest who has since signed in) and fill blanks from the student's profile.
  // A draft that comes back with a signed-in student is posted straight away — that's what they asked for.
  useEffect(() => {
    if (access === "loading") return;
    const draft = requestDraft.get();
    const profile =
      access === "student"
        ? studentProfileApi
            .getMine()
            .then(({ item }) => item)
            .catch(() => null)
        : Promise.resolve(null);
    void profile.then((item) => {
      const filled = withProfileDefaults(draft ?? EMPTY, item);
      setForm(filled);
      if (access === "student" && draft && !autoSubmitted.current && STEPS.every((_, index) => !stepError(index, filled))) {
        autoSubmitted.current = true;
        setStep(STEPS.length - 1);
        void submit(filled);
      }
    });
  }, [access]);

  function update<K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(values: RequestDraft) {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await tuitionRequestsApi.create(toPayload(values));
      notify.success(res.message);
      requestDraft.clear();
      setPosted(res.item);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      notify.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const problem = stepError(step, form);
    if (problem) return setError(problem);
    setError(null);
    if (step < STEPS.length - 1) return setStep(step + 1);

    if (access === "loading") return;
    if (access === "other") return setError("You're signed in with a tutor account. Please use a student account to post a request.");
    if (access === "guest") {
      requestDraft.save(form);
      returnTo.set(PAGE_PATH);
      return setNeedsAccount(true);
    }
    void submit(form);
  }

  if (posted) return <PostedNotice request={posted} />;
  if (needsAccount) return <AccountPrompt onBack={() => setNeedsAccount(false)} />;

  return (
    <form onSubmit={handleNext} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-primary">Tell us what you need</h2>
        <p className="mt-1 text-sm text-text-secondary">Takes about a minute. Verified tutors will apply to you.</p>
      </div>

      <StepIndicator step={step} />

      {error && (
        <div role="alert" className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <fieldset disabled={isSubmitting} className="flex flex-col gap-5 disabled:opacity-70">
        {step === 0 && (
          <>
            <Select
              label="Class"
              required
              placeholder="Choose class"
              options={catalog.classes.map((value) => ({ value, label: value }))}
              value={form.studentClass}
              onChange={(e) => update("studentClass", e.target.value)}
            />
            <Select
              label="Board"
              required
              placeholder="Choose board"
              options={catalog.boards.map((value) => ({ value, label: value }))}
              value={form.board}
              onChange={(e) => update("board", e.target.value)}
            />
            <CreatableMultiSelect
              label="Subjects"
              required
              placeholder="Search or type a subject"
              options={catalog.subjects}
              value={form.subjects}
              onChange={(value) => update("subjects", value)}
              hint="Pick from the list, or type a subject that isn't listed and press Enter."
            />
          </>
        )}

        {step === 1 && (
          <>
            <fieldset>
              <FieldLabel as="legend" required>
                How would you like to study?
              </FieldLabel>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {TUITION_MODE_OPTIONS.map((option) => {
                  const checked = form.tuitionMode === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex h-12 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-secondary/40",
                        checked
                          ? "border-brand-secondary bg-brand-secondary-light/60 text-brand-primary"
                          : "border-border bg-surface text-text-secondary hover:border-brand-secondary/60",
                      )}
                    >
                      <input
                        type="radio"
                        name="tuitionMode"
                        value={option.value}
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
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="City"
                required={form.tuitionMode !== "online"}
                optional={form.tuitionMode === "online"}
                placeholder="e.g. Indore"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
              <Input
                label="Colony / Area"
                required={form.tuitionMode !== "online"}
                optional={form.tuitionMode === "online"}
                placeholder="e.g. Vijay Nagar"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
              />
            </div>
            {form.tuitionMode !== "online" && (
              <Input
                label="Full address"
                optional
                placeholder="House no., street, landmark"
                autoComplete="street-address"
                hint="Only shared with the tutor you accept."
                value={form.fullAddress}
                onChange={(e) => update("fullAddress", e.target.value)}
              />
            )}
            {form.tuitionMode !== "online" && (
              <LocationPicker
                title="Where do you need the tutor?"
                required
                value={form.location}
                onChange={(location) => update("location", location)}
                description={`Only tutors within ${NEARBY_RADIUS_KM} km of this location will see your request. Never shown to them.`}
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label="Monthly budget in ₹"
              required
              placeholder="e.g. 3000"
              type="number"
              inputMode="numeric"
              min={0}
              containerClassName="sm:max-w-xs"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
            <TimingPicker
              label="Preferred timing"
              required
              value={form.schedule ?? ""}
              onChange={(value) => update("schedule", value)}
            />
            <Textarea
              label="Anything else?"
              optional
              placeholder="e.g. Need help preparing for board exams, prefer a female tutor…"
              rows={3}
              maxLength={500}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
            <MobileInput
              label="Mobile number"
              required
              placeholder="10-digit mobile number"
              hint="Only shared with the tutor you accept."
              value={form.mobileNumber}
              onValueChange={(value) => update("mobileNumber", value)}
            />
          </>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {step > 0 && (
            <Button type="button" variant="outline" size="lg" pill={false} onClick={() => {
                setError(null);
                setStep(step - 1);
              }}>
              Back
            </Button>
          )}
          <Button type="submit" size="lg" pill={false} isLoading={isSubmitting} className="sm:px-10">
            {step < STEPS.length - 1 ? "Continue" : "Post my requirement"}
          </Button>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 border-t border-border pt-5 text-center text-sm text-text-secondary">
        {access === "guest" && (
          <p>
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(PAGE_PATH)}`}
              className="font-semibold text-brand-secondary hover:text-brand-primary"
            >
              Sign in
            </Link>{" "}
            first, or keep going — we&apos;ll save your answers.
          </p>
        )}
        <p>
          Prefer to look yourself?{" "}
          <Link href="/find-tutors" className="font-semibold text-brand-secondary hover:text-brand-primary">
            Browse tutors
          </Link>
        </p>
      </div>
    </form>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
      {STEPS.map((label, index) => (
        <li key={label} className="flex flex-col gap-1.5" aria-current={index === step ? "step" : undefined}>
          <span className={cn("h-1.5 rounded-full", index <= step ? "bg-brand-secondary" : "bg-border")} />
          <span className={cn("text-xs", index === step ? "font-semibold text-brand-primary" : "text-text-secondary")}>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function AccountPrompt({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-secondary-light text-brand-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-primary">Almost done!</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            Create a free student account so tutors can reach you.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-4 text-sm text-text-secondary">
        {[
          "Your answers are saved on this device",
          "We post your requirement as soon as you sign in",
          "Your phone number stays private until you accept a tutor",
        ].map((point) => (
          <li key={point} className="flex items-start gap-2">
            <svg className="mt-0.5 shrink-0 text-success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {point}
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button href="/signup/student" pill={false} fullWidth className="whitespace-nowrap">
          Create free account
        </Button>
        <Button href={`/login?next=${encodeURIComponent(PAGE_PATH)}`} pill={false} variant="outline" fullWidth className="whitespace-nowrap">
          Sign in instead
        </Button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-fit text-sm font-semibold text-brand-secondary hover:text-brand-primary"
      >
        ← Edit my answers
      </button>
    </div>
  );
}

function PostedNotice({ request }: { request: TuitionRequest }) {
  return (
    <div className="flex flex-col gap-5">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-primary">Your requirement is live</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Verified tutors can now see your request for <strong>{request.studentClass}</strong> ({request.subjects.join(", ")})
          and apply. We&apos;ll email you as they do. Your phone number stays private until you accept a tutor.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href={`/my-requests?id=${request._id}`} size="lg" pill={false}>
          See tutor responses
        </Button>
        <Button href="/find-tutors" size="lg" pill={false} variant="outline">
          Browse matching tutors
        </Button>
      </div>
    </div>
  );
}
