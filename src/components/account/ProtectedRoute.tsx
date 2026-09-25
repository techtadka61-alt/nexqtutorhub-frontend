"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHomePath } from "@/context/auth-context";
import { UserRole } from "@/types/api";

interface ProtectedRouteProps {
  allow?: UserRole[];
  children: React.ReactNode;
}

/** Client-side route guard: redirects to login when unauthenticated, or to the user's own account home on a role mismatch. */
export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allow && !allow.includes(user.role)) {
      router.replace(roleHomePath(user.role));
    }
  }, [isLoading, user, allow, router]);

  if (isLoading || !user || (allow && !allow.includes(user.role))) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
