"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { AuthFooterLink } from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Logo variant="stacked" href={false} className="h-10 w-auto" />
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-secondary-light text-brand-primary">
          <MailIcon />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-primary">Check your inbox</h1>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            If an account exists for <strong>{email}</strong>, we&rsquo;ve sent a link to reset your
            password. It expires in 15 minutes.
          </p>
        </div>
        <AuthFooterLink prompt="Remembered it?" cta="Back to sign in" href="/login" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Logo variant="stacked" href={false} className="mx-auto h-10 w-auto" />
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Enter the email linked to your account and we&rsquo;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" size="lg" pill={false} isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <AuthFooterLink prompt="Remembered it?" cta="Back to sign in" href="/login" />
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
