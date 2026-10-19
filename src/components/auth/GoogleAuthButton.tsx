"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Input } from "@/components/ui/Input";
import { MobileInput } from "@/components/ui/MobileInput";
import { Textarea } from "@/components/ui/Textarea";
import { notify } from "@/components/ui/Toast";
import { LocationPicker } from "@/components/location/LocationPicker";
import { useAuth } from "@/context/auth-context";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { getGoogleIdToken, GoogleSignInError, isGoogleSignInConfigured } from "@/lib/firebase";
import { NEARBY_RADIUS_KM, type PickedLocation } from "@/lib/geolocation";
import { returnTo } from "@/lib/return-to";
import { mobileError, nameError } from "@/lib/validation";
import { UserRole } from "@/types/api";

type SignupRole = UserRole.STUDENT | UserRole.TUTOR;

interface GoogleAuthButtonProps {
  /** Refuse an existing account with another role (pages that belong to one role, e.g. For Tutors). */
  requireRole?: SignupRole;
  /** Pre-selected role when a new Google user finishes signing up (the signup page they started from). */
  defaultRole?: SignupRole;
  /** Where to go after signing in; defaults to a page remembered before signup, else the user's own start page. */
  next?: string | null;
  /** Button wording: "Sign up with Google" on the signup pages, "Sign in with Google" on login. */
  mode?: "signup" | "signin";
}

/**
 * "Sign up with Google" / "Sign in with Google". An existing account (matched by the Google email) is signed
 * straight in. A new Google user is never created from the popup alone: they first complete sign-up in a dialog —
 * student or tutor, name, mobile number, GPS/map location and full address, and the terms — and only then is the
 * account created (already email-verified, with the Google photo as profile picture) and signed in.
 */
export function GoogleAuthButton({ requireRole, defaultRole, next = null, mode = "signup" }: GoogleAuthButtonProps) {
  const { loginWithGoogle } = useAuth();
  const redirect = usePostLoginRedirect();
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<{ idToken: string; email: string; fullName: string } | null>(null);

  async function start() {
    setNotice(null);
    if (!isGoogleSignInConfigured) {
      setNotice("Google sign-in isn't available right now. Please continue with your email.");
      return;
    }
    setIsBusy(true);
    try {
      const idToken = await getGoogleIdToken();
      const res = await loginWithGoogle({ idToken, ...(requireRole !== undefined && { role: requireRole }) });
      if (res.status === "signed_in") {
        notify.success(res.message);
        await redirect(res.user, next ?? returnTo.get());
      } else {
        setPending({ idToken, email: res.profile.email, fullName: res.profile.fullName });
      }
    } catch (err) {
      if (err instanceof GoogleSignInError) {
        if (!err.cancelled) setNotice(err.message);
        return;
      }
      if (err instanceof ApiError && err.statusCode === 403 && /requested role/i.test(err.message))
        return setNotice("This Google account belongs to a different type of account (student or tutor). Sign in from the login page instead.");
      notify.error(err, "Google sign-in failed. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={start}
        disabled={isBusy}
        aria-busy={isBusy}
        className="inline-flex h-13 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-semibold text-text-primary transition-colors hover:bg-brand-secondary-light/50 focus-ring disabled:cursor-wait disabled:opacity-70"
      >
        <GoogleIcon />
        {isBusy ? "Connecting to Google…" : mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
      </button>
      {notice && (
        <p role="alert" className="text-center text-xs text-text-secondary">
          {notice}
        </p>
      )}
      {pending && (
        <FinishGoogleSignup
          {...pending}
          defaultRole={defaultRole ?? requireRole}
          onCancel={() => setPending(null)}
          onExpired={() => {
            setPending(null);
            setNotice("Your Google session expired. Please click the Google button again.");
          }}
          onDone={async (user, message) => {
            setPending(null);
            notify.success(message);
            await redirect(user, next ?? returnTo.get());
          }}
        />
      )}
    </div>
  );
}

type Field = "fullName" | "mobileNumber" | "address" | "location" | "termsAccepted" | "role";

function FinishGoogleSignup({
  idToken,
  email,
  fullName: googleName,
  defaultRole,
  onCancel,
  onExpired,
  onDone,
}: {
  idToken: string;
  email: string;
  fullName: string;
  defaultRole?: SignupRole;
  onCancel: () => void;
  onExpired: () => void;
  onDone: (user: Parameters<ReturnType<typeof usePostLoginRedirect>>[0], message: string) => Promise<void>;
}) {
  const { loginWithGoogle } = useAuth();
  const [role, setRole] = useState<SignupRole | undefined>(defaultRole);
  const [fullName, setFullName] = useState(googleName);
  const [mobileNumber, setMobileNumber] = useState("");
  const [location, setLocation] = useState<PickedLocation | undefined>();
  const [address, setAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal() puts the dialog in the browser's top layer, above the sticky navbar and any stacking context
  // (the auth card is `relative z-10`, which used to trap a z-50 overlay beneath the navbar).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const errors: Partial<Record<Field, string | null>> = {
    role: role === undefined ? "Choose student or tutor." : null,
    fullName: nameError(fullName),
    mobileNumber: mobileError(mobileNumber),
    location: location ? null : "Please share your location (use GPS, search your area, or drop a pin).",
    address:
      address.trim().length < 5
        ? "Please enter your full address (house / street, area, city)."
        : address.length > 300
          ? "Address must be at most 300 characters."
          : null,
    termsAccepted: termsAccepted ? null : "Please accept the Terms of Service and Privacy Policy to continue.",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  function clearServerError(field: Field) {
    setServerErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }
  const fieldError = (field: Field) => serverErrors[field] ?? (submitted ? errors[field] ?? undefined : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors || role === undefined || !location) return;
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle({
        idToken,
        role,
        fullName: fullName.trim(),
        mobileNumber,
        address: address.trim(),
        location,
        termsAccepted: true,
      });
      if (res.status === "signed_in") await onDone(res.user, res.message);
    } catch (err) {
      if (err instanceof ApiError) {
        // Google ID tokens last an hour; past that the user simply signs in with Google again.
        if (err.statusCode === 401) return onExpired();
        setServerErrors(err.fieldErrors);
      }
      notify.error(err, "Couldn't create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="google-finish-title"
      onCancel={(e) => {
        // Escape: close like Cancel, but never mid-submit.
        e.preventDefault();
        if (!isSubmitting) onCancel();
      }}
      className="m-auto max-h-[min(92dvh,860px)] w-[calc(100%-2rem)] max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-surface p-0 text-text-primary shadow-lifted backdrop:bg-black/50 backdrop:backdrop-blur-[2px] open:flex open:animate-[modal-in_180ms_ease-out] max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none"
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 pb-4 pt-6 sm:px-8">
        <div className="min-w-0">
          <h2 id="google-finish-title" className="font-display text-xl font-bold text-brand-primary sm:text-2xl">
            Complete your sign up
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Signing up with Google as <span className="break-all font-semibold text-text-primary">{email}</span>. Add your
            contact number, location and address — NexTutorHub is free for students and tutors.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          disabled={isSubmitting}
          onClick={onCancel}
          className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-brand-secondary-light/60 hover:text-text-primary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* `isolate` keeps the map's own z-indexes (Leaflet panes/controls) inside this scroll area, under header/footer. */}
      <div className="isolate min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8">
        <form id="google-finish-form" onSubmit={submit} noValidate className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <FieldLabel as="legend" required>
              I want to
            </FieldLabel>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(
                [
                  { value: UserRole.STUDENT, title: "Find a tutor", hint: "Student / parent" },
                  { value: UserRole.TUTOR, title: "Teach students", hint: "Tutor" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={role === option.value}
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "flex cursor-pointer flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors focus-ring",
                    role === option.value
                      ? "border-brand-secondary bg-brand-secondary-light text-brand-primary"
                      : "border-border bg-surface text-text-primary hover:border-brand-secondary",
                  )}
                >
                  <span className="text-sm font-semibold">{option.title}</span>
                  <span className="text-xs text-text-secondary">{option.hint}</span>
                </button>
              ))}
            </div>
            {fieldError("role") && <p className="text-xs font-medium text-error">{fieldError("role")}</p>}
          </fieldset>

          <Input
            label="Full name"
            autoComplete="name"
            required
            value={fullName}
            error={fieldError("fullName")}
            onChange={(e) => {
              setFullName(e.target.value);
              clearServerError("fullName");
            }}
          />
          <MobileInput
            label="Mobile number"
            hint={role === UserRole.TUTOR ? "Students near you can call you on this number." : "Tutors near you can call you on this number."}
            required
            value={mobileNumber}
            error={fieldError("mobileNumber")}
            onValueChange={(value) => {
              setMobileNumber(value);
              clearServerError("mobileNumber");
            }}
          />

          <div className="flex flex-col gap-1.5">
            <LocationPicker
              title={role === UserRole.TUTOR ? "Where can you provide home tuition?" : "Where do you need home tuition?"}
              required
              value={location}
              onChange={(picked) => {
                setLocation(picked);
                // The picked place's address is a good starting point; the user completes it (house no., street).
                if (picked?.address && !address.trim()) setAddress(picked.address);
              }}
              description={
                role === UserRole.TUTOR
                  ? `Use your current GPS location (or search / drop a pin). Lets students within ${NEARBY_RADIUS_KM} km find you. Never shown publicly.`
                  : `Use your current GPS location (or search / drop a pin). Lets us show you tutors within ${NEARBY_RADIUS_KM} km. Never shown publicly.`
              }
            />
            {fieldError("location") && <p className="text-xs font-medium text-error">{fieldError("location")}</p>}
          </div>

          <Textarea
            label="Full address"
            required
            rows={2}
            maxLength={300}
            placeholder="House no., street, area, city"
            hint="Kept private — only the distance is shown to others."
            value={address}
            error={fieldError("address")}
            onChange={(e) => {
              setAddress(e.target.value);
              clearServerError("address");
            }}
          />

          <Checkbox
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
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
        </form>
      </div>

      <footer className="flex flex-col-reverse gap-3 border-t border-border bg-surface px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
        <Button type="button" variant="ghost" pill={false} disabled={isSubmitting} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" form="google-finish-form" pill={false} isLoading={isSubmitting}>
          Create my account
        </Button>
      </footer>
    </dialog>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.62h6.47a5.54 5.54 0 01-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0012 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 010-4.54v-3.1H1.27a12 12 0 000 10.75l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 001.27 6.63l4 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
