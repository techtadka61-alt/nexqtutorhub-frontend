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

const STEPS = ["क्या पढ़ना है", "कहाँ और कैसे", "आखिरी जानकारी"] as const;

/** Hindi labels for the form; the shared TUITION_MODE_OPTIONS stay English for the account pages. */
const MODE_LABEL: Record<(typeof TUITION_MODE_OPTIONS)[number]["value"], string> = {
  home: "घर पर ट्यूशन",
  online: "ऑनलाइन ट्यूशन",
  both: "दोनों (घर पर और ऑनलाइन)",
};

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
    if (!form.studentClass) return "क्लास चुनें।";
    if (!form.subjects.length) return "कम से कम एक सब्जेक्ट चुनें।";
    if (!form.board) return "बोर्ड चुनें।";
  }
  if (step === 1) {
    if (!form.tuitionMode) return "बताएं कि आप कैसे पढ़ना चाहते हैं।";
    if (form.tuitionMode !== "online" && (form.city ?? "").trim().length < 2)
      return "अपना शहर लिखें, ताकि पास के ट्यूटर आपको ढूंढ सकें।";
    if (form.tuitionMode !== "online" && (form.area ?? "").trim().length < 2)
      return "अपना एरिया / कॉलोनी लिखें।";
    if (form.tuitionMode !== "online" && !form.location)
      return `मैप पर बताएं कि ट्यूटर कहाँ चाहिए, ताकि ${NEARBY_RADIUS_KM} किमी के अंदर के ट्यूटर आपकी request देख सकें।`;
  }
  if (step === 2) {
    if (!isValidMobile(form.mobileNumber)) return VALIDATION_MESSAGES.mobile;
    if (!form.budget || !(Number(form.budget) > 0)) return "अपना महीने का बजट लिखें।";
    if (!form.schedule?.trim()) return "पढ़ाई के दिन और टाइम चुनें।";
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
    if (access === "other") return setError("आप ट्यूटर अकाउंट से लॉग-इन हैं। Request डालने के लिए स्टूडेंट अकाउंट इस्तेमाल करें।");
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
    <form lang="hi" onSubmit={handleNext} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-primary">बताएं आपको क्या चाहिए</h2>
        <p className="mt-1 text-sm text-text-secondary">बस एक मिनट लगेगा। Verified ट्यूटर आपको apply करेंगे।</p>
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
              label="क्लास"
              required
              placeholder="क्लास चुनें (Nursery – Class 12)"
              options={catalog.classes.map((value) => ({ value, label: value }))}
              value={form.studentClass}
              onChange={(e) => update("studentClass", e.target.value)}
            />
            <Select
              label="बोर्ड"
              required
              placeholder="बोर्ड चुनें"
              options={catalog.boards.map((value) => ({ value, label: value }))}
              value={form.board}
              onChange={(e) => update("board", e.target.value)}
            />
            <CreatableMultiSelect
              label="सब्जेक्ट"
              required
              placeholder="सब्जेक्ट खोजें या लिखें"
              options={catalog.subjects}
              value={form.subjects}
              onChange={(value) => update("subjects", value)}
              hint="लिस्ट से चुनें, या जो सब्जेक्ट लिस्ट में नहीं है उसे लिखकर Enter दबाएं।"
            />
          </>
        )}

        {step === 1 && (
          <>
            <fieldset>
              <FieldLabel as="legend" required>
                आप कैसे पढ़ना चाहते हैं?
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
                      {MODE_LABEL[option.value]}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="शहर"
                required={form.tuitionMode !== "online"}
                optional={form.tuitionMode === "online"}
                placeholder="जैसे रॉबर्ट्सगंज, ओबरा, रेणुकूट"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
              <Input
                label="आपका एरिया / कॉलोनी"
                required={form.tuitionMode !== "online"}
                optional={form.tuitionMode === "online"}
                placeholder="मोहल्ला या कॉलोनी का नाम"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
              />
            </div>
            {form.tuitionMode !== "online" && (
              <Input
                label="पूरा पता"
                optional
                placeholder="मकान नंबर, गली, लैंडमार्क"
                autoComplete="street-address"
                hint="सिर्फ़ उसी ट्यूटर को दिखेगा जिसे आप चुनेंगे।"
                value={form.fullAddress}
                onChange={(e) => update("fullAddress", e.target.value)}
              />
            )}
            {form.tuitionMode !== "online" && (
              <LocationPicker
                title="ट्यूटर कहाँ चाहिए?"
                required
                value={form.location}
                onChange={(location) => update("location", location)}
                description={`सिर्फ़ इस जगह से ${NEARBY_RADIUS_KM} किमी के अंदर के ट्यूटर आपकी request देखेंगे। यह लोकेशन उन्हें नहीं दिखाई जाती।`}
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label="महीने का बजट (₹)"
              required
              placeholder="जैसे 3000"
              type="number"
              inputMode="numeric"
              min={0}
              containerClassName="sm:max-w-xs"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
            <TimingPicker
              label="पढ़ाई का टाइम"
              required
              value={form.schedule ?? ""}
              onChange={(value) => update("schedule", value)}
            />
            <Textarea
              label="और कुछ बताना है?"
              optional
              placeholder="जैसे बोर्ड एग्ज़ाम की तैयारी चाहिए, लेडी ट्यूटर चाहिए…"
              rows={3}
              maxLength={500}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
            <MobileInput
              label="मोबाइल नंबर"
              required
              placeholder="10 अंकों का मोबाइल नंबर"
              hint="सिर्फ़ उसी ट्यूटर को दिखेगा जिसे आप चुनेंगे।"
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
              वापस
            </Button>
          )}
          <Button type="submit" size="lg" pill={false} isLoading={isSubmitting} className="sm:px-10">
            {step < STEPS.length - 1 ? "आगे बढ़ें" : "मेरी requirement भेजें"}
          </Button>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 border-t border-border pt-5 text-center text-sm text-text-secondary">
        {access === "guest" && (
          <p>
            पहले से अकाउंट है?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(PAGE_PATH)}`}
              className="font-semibold text-brand-secondary hover:text-brand-primary"
            >
              लॉग-इन
            </Link>{" "}
            करें, या आगे बढ़ें — आपके जवाब सेव रहेंगे।
          </p>
        )}
        <p>
          खुद देखना चाहते हैं?{" "}
          <Link href="/find-tutors" className="font-semibold text-brand-secondary hover:text-brand-primary">
            ट्यूटर देखें
          </Link>
        </p>
      </div>
    </form>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="प्रोग्रेस">
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
          <h2 className="font-display text-2xl font-bold text-brand-primary">बस थोड़ा और!</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
            फ्री स्टूडेंट अकाउंट बनाएं, ताकि ट्यूटर आप तक पहुँच सकें।
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-4 text-sm text-text-secondary">
        {[
          "आपके जवाब इसी फ़ोन/कंप्यूटर पर सेव हैं",
          "लॉग-इन करते ही हम आपकी requirement पोस्ट कर देंगे",
          "ट्यूटर चुनने तक आपका फ़ोन नंबर प्राइवेट रहेगा",
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
          फ्री अकाउंट बनाएं
        </Button>
        <Button href={`/login?next=${encodeURIComponent(PAGE_PATH)}`} pill={false} variant="outline" fullWidth className="whitespace-nowrap">
          लॉग-इन करें
        </Button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-fit text-sm font-semibold text-brand-secondary hover:text-brand-primary"
      >
        ← जवाब बदलें
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
        <h2 className="font-display text-2xl font-bold text-brand-primary">आपकी requirement लाइव है</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Verified ट्यूटर अब <strong>{request.studentClass}</strong> ({request.subjects.join(", ")}) के लिए आपकी request
          देख सकते हैं और apply कर सकते हैं। जैसे-जैसे वे apply करेंगे, हम आपको ईमेल करेंगे। ट्यूटर चुनने तक आपका
          फ़ोन नंबर प्राइवेट रहेगा।
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href={`/my-requests?id=${request._id}`} size="lg" pill={false}>
          ट्यूटर्स के जवाब देखें
        </Button>
        <Button href="/find-tutors" size="lg" pill={false} variant="outline">
          मैच होने वाले ट्यूटर देखें
        </Button>
      </div>
    </div>
  );
}
