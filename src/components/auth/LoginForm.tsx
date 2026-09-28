"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { OrDivider } from "@/components/auth/OrDivider";
import { JoinAsButtons } from "@/components/auth/JoinAsButtons";
import { useAuth, roleHomePath } from "@/context/auth-context";
import { UserRole } from "@/types/api";
import { ApiError } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login({ email, password });
      // Tutors go straight to the apply form on the For Tutors page; everyone else to their account.
      router.push(user.role === UserRole.TUTOR ? "/for-tutors#apply" : roleHomePath(user.role));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 403 && /verify/i.test(err.message)) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-[clamp(10px,2.2vh,28px)]">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-brand-primary sm:text-3xl">Welcome back</h1>
        <p className="mt-1.5 text-sm text-text-secondary">Login to your NexTutorHub account.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[clamp(10px,2.2vh,20px)]">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
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
      <GoogleAuthButton />

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
