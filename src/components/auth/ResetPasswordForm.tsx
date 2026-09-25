"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { AuthFooterLink } from "@/components/auth/AuthShell";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Logo variant="stacked" href={false} className="h-10 w-auto" />
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckIcon />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-primary">Password reset</h1>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            Your password has been changed successfully. Please sign in again.
          </p>
        </div>
        <Button size="lg" pill={false} onClick={() => router.push("/login")}>
          Continue to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Logo variant="stacked" href={false} className="mx-auto h-10 w-auto" />
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Make it strong — at least 8 characters, with letters and numbers.
        </p>
      </div>

      {!token && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          This link is missing a reset token. Please use the link from your email, or request a new
          one from the forgot password page.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter a new password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" size="lg" pill={false} isLoading={isSubmitting} disabled={!token}>
          Reset password
        </Button>
      </form>

      <AuthFooterLink prompt="Remembered it?" cta="Back to sign in" href="/login" />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
