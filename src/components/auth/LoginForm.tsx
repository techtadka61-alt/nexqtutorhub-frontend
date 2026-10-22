"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { OrDivider } from "@/components/auth/OrDivider";
import { JoinAsButtons } from "@/components/auth/JoinAsButtons";
import { useAuth } from "@/context/auth-context";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { UserRole } from "@/types/api";
import { ApiError } from "@/lib/api-client";
import { returnTo, safeReturnPath } from "@/lib/return-to";
import { requiredRoleFor, ROLE_NAME } from "@/lib/route-access";
import { isValidEmail, VALIDATION_MESSAGES } from "@/lib/validation";
import { notify } from "@/components/ui/Toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = safeReturnPath(searchParams.get("next"));
  // Arriving from the verify-email page: the address is pre-filled and confirmed.
  const justVerified = searchParams.get("verified") === "1";
  const { login } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Set when the account is fine but the page they came from is for another role.
  const [wrongRole, setWrongRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageRole = requiredRoleFor(nextParam);
  /** Where to go after signing in: the page that sent them here, else their own starting point. */
  const goOn = usePostLoginRedirect();
  const googleRole = pageRole === UserRole.STUDENT || pageRole === UserRole.TUTOR ? pageRole : undefined;

  async function signIn(next: string | null) {
    setError(null);
    setWrongRole(null);
    if (!isValidEmail(email)) return setError(VALIDATION_MESSAGES.email);
    // A page that belongs to one role (e.g. For Tutors) asks the API to refuse other roles' accounts, so a
    // student can't sign in "into" a tutor-only page.
    const role = requiredRoleFor(next);
    setIsSubmitting(true);
    try {
      const { user, message } = await login({ email: email.trim(), password, ...(role !== undefined && { role }) });
      notify.success(message);
      await goOn(user, next);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 403 && /verify/i.test(err.message)) {
          notify.error(err);
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        if (err.statusCode === 403 && /requested role/i.test(err.message) && role !== undefined) return setWrongRole(role);
      }
      notify.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Back to the page that sent them to login (the ?next= param, or the page remembered before they
    // registered and verified in another tab).
    void signIn(nextParam ?? returnTo.get());
  }

  /** Give up on the role-only page and just sign in to their own account. */
  function continueToOwnAccount() {
    returnTo.clear();
    router.replace("/login");
    void signIn(null);
  }

  return (
    <div className="flex flex-col gap-[clamp(10px,2.2vh,28px)]">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">Welcome back</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          {pageRole !== undefined
            ? `Sign in with your ${ROLE_NAME[pageRole].singular} account to continue.`
            : "Login to your NexTutorHub account."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[clamp(10px,2.2vh,20px)]">
        {wrongRole !== null && (
          <div role="alert" className="rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-text-primary">
            <p className="font-semibold">This page is only for {ROLE_NAME[wrongRole].plural}.</p>
            <p className="mt-1 text-text-secondary">
              The account you entered isn&apos;t a {ROLE_NAME[wrongRole].singular} account. Sign in with a{" "}
              {ROLE_NAME[wrongRole].singular} account, or{" "}
              <button
                type="button"
                onClick={continueToOwnAccount}
                className="font-semibold text-brand-secondary underline underline-offset-2 hover:text-brand-primary"
              >
                continue to your own account
              </button>
              .
            </p>
          </div>
        )}
        {justVerified && !error && (
          <div role="status" className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success-strong">
            Your email is verified. Please sign in to continue.
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <Input
          type="email"
          autoComplete="email"
          placeholder="Email address"
          leftIcon={<MailIcon />}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          leftIcon={<LockIcon />}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="-mt-2 flex justify-end">
          <a href="/forgot-password" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary">
            Forgot Password?
          </a>
        </div>

        <Button type="submit" size="lg" pill={false} isLoading={isSubmitting} className="relative">
          Login
          {!isSubmitting && (
            <span className="absolute right-5">
              <ArrowIcon />
            </span>
          )}
        </Button>
      </form>

      <OrDivider />
      <GoogleAuthButton mode="signin" requireRole={googleRole} next={nextParam} />

      <JoinAsButtons />
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 118 0v4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
