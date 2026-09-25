import Link from "next/link";

/** Login page's route into signup: one signup page per role, so the role is picked here. */
export function JoinAsButtons() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm font-medium text-text-secondary">New here? Join as</p>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/signup/student"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-brand-secondary bg-brand-secondary-light/40 text-sm font-semibold text-brand-secondary transition-colors hover:bg-brand-secondary-light focus-ring"
        >
          <CapIcon />
          I&apos;m a Student
        </Link>
        <Link
          href="/signup/tutor"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-info bg-info/5 text-sm font-semibold text-info transition-colors hover:bg-info/10 focus-ring"
        >
          <UserIcon />
          I&apos;m a Tutor
        </Link>
      </div>
    </div>
  );
}

function CapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l10 5-10 5L2 8l10-5Z" strokeLinejoin="round" />
      <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" strokeLinecap="round" />
    </svg>
  );
}
