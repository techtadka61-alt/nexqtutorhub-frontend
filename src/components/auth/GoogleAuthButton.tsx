"use client";

import { useState } from "react";

/** Google Sign-In isn't wired up on the backend yet (no OAuth endpoint exists) — shown for a familiar layout, informs on click. */
export function GoogleAuthButton() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setShowNotice(true)}
        className="inline-flex h-13 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-semibold text-text-primary transition-colors hover:bg-brand-secondary-light/50 focus-ring"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      {showNotice && (
        <p className="text-center text-xs text-text-secondary">
          Google sign-in is coming soon. Please continue with your email for now.
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
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
