"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { MobileInput } from "@/components/ui/MobileInput";
import {
  confirmPasswordError,
  emailError,
  mobileError,
  nameError,
  PASSWORD_HINT,
  passwordError,
} from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { LocationPicker } from "@/components/location/LocationPicker";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { OrDivider } from "@/components/auth/OrDivider";
import { AuthFooterLink } from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";
import { notify } from "@/components/ui/Toast";
import { NEARBY_RADIUS_KM, type PickedLocation } from "@/lib/geolocation";
import { UserRole } from "@/types/api";

export type SignupRole = "student" | "tutor";

const ROLE_COPY: Record<
  SignupRole,
  { title: string; subtitle: string; submit: string; switchPrompt: string; switchCta: string; switchHref: string }
> = {
  student: {
    title: "Create your student account",
    subtitle: "Tell us who you are — you'll set up your learning requirement next.",
    submit: "Create student account",
    switchPrompt: "Want to become a tutor?",
    switchCta: "Register as Tutor",
    switchHref: "/signup/tutor",
  },
  tutor: {
    title: "Create your tutor account",
    subtitle: "Tell us who you are — you'll build your teaching profile next.",
    submit: "Create tutor account",
    switchPrompt: "Looking for a tutor?",
    switchCta: "Register as Student",
    switchHref: "/signup/student",
  },
};

interface FormState {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  location?: PickedLocation;
}

type Field = "fullName" | "email" | "mobileNumber" | "password" | "confirmPassword" | "termsAccepted";

/** Client-side mirror of the API's RegisterStudentDto / RegisterTutorDto rules. */
function validate(form: FormState): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string | null>> = {
    fullName: nameError(form.fullName),
    mobileNumber: mobileError(form.mobileNumber),
    email: emailError(form.email),
    password: passwordError(form.password),
    confirmPassword: confirmPasswordError(form.password, form.confirmPassword),
    termsAccepted: form.termsAccepted ? null : "Please accept the Terms of Service and Privacy Policy to continue.",
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as Partial<Record<Field, string>>;
}

const INITIAL_STATE: FormState = {
  fullName: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

export function SignupForm({ role }: { role: SignupRole }) {
  const router = useRouter();
  const copy = ROLE_COPY[role];
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // A field's error shows once the user has left it (or tried to submit), then updates live as they type.
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  // Errors returned by the API (e.g. "email already registered"); cleared as soon as that field is edited.
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const clientErrors = validate(form);

  function fieldError(field: Field): string | undefined {
    if (serverErrors[field]) return serverErrors[field];
    // Confirm password is checked as soon as anything is typed into it, so a mismatch shows immediately.
    const live = field === "confirmPassword" && form.confirmPassword !== "";
    return submitted || touched[field] || live ? clientErrors[field] : undefined;
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setServerErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function touch(field: Field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(clientErrors).length) return;

    setIsSubmitting(true);
    // The API stores Indian mobile numbers as the bare 10 digits.
    const payload = { ...form, fullName: form.fullName.trim(), email: form.email.trim().toLowerCase() };
    try {
      const register = role === "student" ? authApi.registerStudent : authApi.registerTutor;
      const res = await register(payload);
      notify.success(res.message);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      notify.error(err);
      // Field errors also go under their inputs, so the user sees exactly what to fix.
      if (err instanceof ApiError) setServerErrors(err.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">{copy.title}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{copy.subtitle}</p>
      </div>

      <GoogleAuthButton mode="signup" defaultRole={role === "tutor" ? UserRole.TUTOR : UserRole.STUDENT} />
      <OrDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-4">
          <Input
            label="Full name"
            autoComplete="name"
            labelAsPlaceholder
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            onBlur={() => touch("fullName")}
            error={fieldError("fullName")}
          />

          <MobileInput
            label="Mobile number"
            labelAsPlaceholder
            required
            value={form.mobileNumber}
            onValueChange={(value) => update("mobileNumber", value)}
            onBlur={() => touch("mobileNumber")}
            error={fieldError("mobileNumber")}
          />

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            labelAsPlaceholder
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => touch("email")}
            error={fieldError("email")}
            containerClassName="sm:col-span-2"
          />

          <Input
            label="Password"
            hint={PASSWORD_HINT}
            type="password"
            autoComplete="new-password"
            labelAsPlaceholder
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            onBlur={() => touch("password")}
            error={fieldError("password")}
          />

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            labelAsPlaceholder
            required
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            onBlur={() => touch("confirmPassword")}
            error={fieldError("confirmPassword")}
          />
        </div>

        <LocationPicker
          optional
          title={role === "tutor" ? "Where can you provide home tuition?" : "Where do you need home tuition?"}
          value={form.location}
          onChange={(location) => update("location", location)}
          description={
            role === "tutor"
              ? `Lets students within ${NEARBY_RADIUS_KM} km find you. Never shown publicly — you can also add it later in your profile.`
              : `Lets us show you tutors within ${NEARBY_RADIUS_KM} km. Never shown publicly — you can also add it later in your profile.`
          }
        />

        <Checkbox
          checked={form.termsAccepted}
          onChange={(e) => update("termsAccepted", e.target.checked)}
          error={fieldError("termsAccepted")}
          label={
            <span>
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener" className="font-semibold text-brand-secondary hover:text-brand-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener" className="font-semibold text-brand-secondary hover:text-brand-primary">
                Privacy Policy
              </a>
              <span className="text-error"> *</span>
            </span>
          }
        />

        <Button type="submit" size="lg" pill={false} isLoading={isSubmitting}>
          {copy.submit}
        </Button>
      </form>

      <div className="flex flex-col gap-2 border-t border-border pt-5">
        <AuthFooterLink prompt="Already have an account?" cta="Login here" href="/login" />
        <AuthFooterLink prompt={copy.switchPrompt} cta={copy.switchCta} href={copy.switchHref} />
      </div>
    </div>
  );
}
