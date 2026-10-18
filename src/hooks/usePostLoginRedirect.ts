"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { roleHomePath } from "@/context/auth-context";
import { studentProfileApi } from "@/lib/api/profile";
import { returnTo } from "@/lib/return-to";
import { missingRequirement, REQUIREMENT_SETUP_PATH } from "@/lib/student-requirement";
import { UserRole, type SafeUser } from "@/types/api";

/** If the profile can't be loaded, don't block login on it — the listing page re-checks. */
async function needsRequirement(): Promise<boolean> {
  try {
    const { item } = await studentProfileApi.getMine();
    return missingRequirement(item).length > 0;
  } catch {
    return false;
  }
}

/**
 * Where to go after signing in (password or Google): the page that sent them here, else their own starting point.
 * A student who hasn't submitted their learning requirement fills it in first — unless they were on their way
 * somewhere specific (e.g. back to the request form they filled in as a guest).
 */
export function usePostLoginRedirect() {
  const router = useRouter();
  return useCallback(
    async (user: SafeUser, next: string | null) => {
      returnTo.clear();
      if (!next && user.role === UserRole.STUDENT && (await needsRequirement())) {
        router.push(REQUIREMENT_SETUP_PATH);
        return;
      }
      if (next) router.push(next === "/for-tutors" && user.role === UserRole.TUTOR ? "/for-tutors#apply" : next);
      else if (user.role === UserRole.SUPER_ADMIN) window.location.assign(roleHomePath(user.role)); // separate admin app
      else router.push(user.role === UserRole.TUTOR ? "/for-tutors#apply" : roleHomePath(user.role));
    },
    [router],
  );
}
