"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth, roleHomePath } from "@/context/auth-context";
import { UserRole } from "@/types/api";
import { returnTo } from "@/lib/return-to";
import { ROLE_NAME } from "@/lib/route-access";

interface ProtectedRouteProps {
  /** Roles allowed on this page; omit to allow any signed-in user. */
  allow?: UserRole[];
  /** Let signed-out visitors through too (the role check still applies once they're signed in). */
  allowGuests?: boolean;
  children: React.ReactNode;
}

/**
 * Client-side route guard. Unauthenticated visitors go to login (with this page as `next`, so login returns
 * here) unless `allowGuests`; a signed-in user with the wrong role sees an explanation instead of the page.
 * The API enforces the same roles — this is about telling people why, not about security.
 */
export function ProtectedRoute({ allow, allowGuests, children }: ProtectedRouteProps) {
  const { user, isLoading, didLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || user || allowGuests) return;
    // After a deliberate logout, don't carry this page into the next login (it may be someone else's).
    if (didLogout) {
      router.replace("/login");
      return;
    }
    returnTo.set(pathname);
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isLoading, user, allowGuests, router, pathname, didLogout]);

  if (isLoading || (!user && !allowGuests)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
      </div>
    );
  }

  if (user && allow && !allow.includes(user.role)) return <AccessDenied allow={allow} role={user.role} />;

  return <>{children}</>;
}

function AccessDenied({ allow, role }: { allow: UserRole[]; role: UserRole }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const who = allow.map((allowed) => ROLE_NAME[allowed].plural).join(" and ");

  async function switchAccount() {
    await logout();
    // Come back here after signing in with the right account.
    returnTo.set(pathname);
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-12">
      <div role="alert" className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-soft sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
          </svg>
        </span>
        <h1 className="mt-4 font-display text-xl font-bold text-brand-primary">This page is only for {who}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          You&apos;re signed in with a {ROLE_NAME[role].singular} account. Switch to a {ROLE_NAME[allow[0]].singular}{" "}
          account to continue.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href={roleHomePath(role)} pill={false}>
            Go to my dashboard
          </Button>
          <Button variant="outline" pill={false} onClick={switchAccount}>
            Switch account
          </Button>
        </div>
      </div>
    </div>
  );
}
