"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { OrDivider } from "@/components/auth/OrDivider";
import { AuthFooterLink } from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";

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
}

const INITIAL_STATE: FormState = {
  fullName: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

/**
 * Backend validates with class-validator's IsMobilePhone('en-IN'), which rejects spaces/dashes and
 * requires a bare 10-digit number or a +91-prefixed one with no separators. Strip formatting the
 * user naturally types (spaces, dashes) and add +91 when no country code is present.
 */
function normalizeMobile(value: string): string {
  const digitsAndPlus = value.trim().replace(/[\s-]/g, "");
  if (/^\d{10}$/.test(digitsAndPlus)) return `+91${digitsAndPlus}`;
  return digitsAndPlus;
}

export function SignupForm({ role }: { role: SignupRole }) {
  const router = useRouter();
  const copy = ROLE_COPY[role];
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }
    if (!form.termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setIsSubmitting(true);
    const payload = { ...form, mobileNumber: normalizeMobile(form.mobileNumber) };
    try {
      const register = role === "student" ? authApi.registerStudent : authApi.registerTutor;
      await register(payload);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
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

      <GoogleAuthButton />
      <OrDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-4">
          <Input
            label="Full name"
            autoComplete="name"
            labelAsPlaceholder
            required
            minLength={2}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />

          <Input
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            labelAsPlaceholder
            required
            value={form.mobileNumber}
            onChange={(e) => update("mobileNumber", e.target.value)}
          />

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            labelAsPlaceholder
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            containerClassName="sm:col-span-2"
          />

          <Input
            label="Password"
            hint="At least 8 characters, with letters & numbers"
            type="password"
            autoComplete="new-password"
            labelAsPlaceholder
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            labelAsPlaceholder
            required
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
          />
        </div>

        <Checkbox
          checked={form.termsAccepted}
          onChange={(e) => update("termsAccepted", e.target.checked)}
          label={
            <span>
              I agree to the{" "}
              <a href="/terms" className="font-semibold text-brand-secondary hover:text-brand-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="font-semibold text-brand-secondary hover:text-brand-primary">
                Privacy Policy
              </a>
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
