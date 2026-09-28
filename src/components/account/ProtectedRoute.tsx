"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, roleHomePath } from "@/context/auth-context";
import { UserRole } from "@/types/api";
import { returnTo } from "@/lib/return-to";

interface ProtectedRouteProps {
  allow?: UserRole[];
  children: React.ReactNode;
}

/**
 * Client-side route guard: redirects to login when unauthenticated (passing the current page as `next`, so
 * login returns here), or to the user's own account home on a role mismatch.
 */
export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const { user, isLoading, didLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // After a deliberate logout, don't carry this page into the next login (it may be someone else's).
      if (didLogout) {
        router.replace("/login");
        return;
      }
      returnTo.set(pathname);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allow && !allow.includes(user.role)) {
      router.replace(roleHomePath(user.role));
    }
  }, [isLoading, user, allow, router, pathname, didLogout]);

  if (isLoading || !user || (allow && !allow.includes(user.role))) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
