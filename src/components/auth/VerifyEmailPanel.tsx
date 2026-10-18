"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";

type Status = "idle" | "verifying" | "success" | "error";

/** localStorage key used to tell the signup tab ("Check your inbox") that the link was opened in another tab. */
const VERIFIED_SIGNAL_KEY = "nth_email_verified";
const REDIRECT_DELAY_MS = 2000;

function loginUrl(email: string | null) {
  return `/login?verified=1${email ? `&email=${encodeURIComponent(email)}` : ""}`;
}

export function VerifyEmailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "idle");
  const [message, setMessage] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  // The token is single-use: React Strict Mode runs effects twice in development, and a second call would
  // fail with "invalid link" and overwrite the success state.
  const requested = useRef(false);
  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;
    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        try {
          window.localStorage.setItem(VERIFIED_SIGNAL_KEY, JSON.stringify({ email, at: Date.now() }));
        } catch {}
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "This verification link is invalid or expired.");
      });
  }, [token, email]);

  // Verified: go straight to sign-in in this tab.
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => router.replace(loginUrl(email)), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, email, router]);

  // The "Check your inbox" tab left open after signup: when the link is opened in another tab of this
  // browser, move this tab to sign-in too.
  useEffect(() => {
    if (token) return;
    function onStorage(event: StorageEvent) {
      if (event.key === VERIFIED_SIGNAL_KEY && event.newValue) router.replace(loginUrl(email));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [token, email, router]);

  async function handleResend() {
    if (!email) return;
    setResendState("sending");
    try {
      await authApi.sendVerificationEmail(email);
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  }

  if (status === "verifying") {
    return (
      <StatusCard
        icon={<Spinner />}
        title="Verifying your email…"
        description="This will just take a moment."
      />
    );
  }

  if (status === "success") {
    return (
      <StatusCard
        icon={<CheckCircleIcon />}
        tone="success"
        title="Email verified"
        description="Your email has been verified successfully. Taking you to sign in…"
        action={
          <Button size="lg" pill={false} onClick={() => router.replace(loginUrl(email))}>
            Continue to sign in
          </Button>
        }
      />
    );
  }

  if (status === "error") {
    return (
      <StatusCard
        icon={<AlertIcon />}
        tone="error"
        title="Verification failed"
        description={message ?? "This verification link is invalid or has expired."}
        action={
          email ? (
            <Button size="lg" pill={false} onClick={handleResend} isLoading={resendState === "sending"}>
              {resendState === "sent" ? "Verification email sent" : "Resend verification email"}
            </Button>
          ) : (
            <Button size="lg" pill={false} href="/login">
              Back to sign in
            </Button>
          )
        }
      />
    );
  }

  return (
    <StatusCard
      icon={<MailIcon />}
      title="Check your inbox"
      description={
        email
          ? `We've sent a verification link to ${email}. Click the link to activate your account, then sign in.`
          : "We've sent a verification link to your email address. Click the link to activate your account, then sign in."
      }
      action={
        email && (
          <Button variant="outline" size="lg" pill={false} onClick={handleResend} isLoading={resendState === "sending"}>
            {resendState === "sent" ? "Email sent again" : "Resend verification email"}
          </Button>
        )
      }
      footer={
        <p className="text-center text-sm text-text-secondary">
          Already verified?{" "}
          <a href="/login" className="font-semibold text-brand-secondary hover:text-brand-primary">
            Sign in
          </a>
        </p>
      }
    />
  );
}

function StatusCard({
  icon,
  title,
  description,
  action,
  footer,
  tone = "brand",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "brand" | "success" | "error";
}) {
  const toneClasses = {
    brand: "bg-brand-secondary-light text-brand-primary",
    success: "bg-success/10 text-success",
    error: "bg-error/10 text-error",
  }[tone];

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Logo variant="stacked" href={false} className="h-10 w-auto" />
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${toneClasses}`}>{icon}</span>
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-primary">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p>
      </div>
      {action}
      {footer}
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

function CheckCircleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
