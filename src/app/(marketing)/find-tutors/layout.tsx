import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { UserRole } from "@/types/api";

const ALLOW = [UserRole.STUDENT];

// Covers the listing and every tutor profile (/find-tutors/[id], a client page that cannot export metadata itself).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Students only (listing and tutor detail): guests go to login/register first and come back here. */
export default function FindTutorsLayout({ children }: LayoutProps<"/find-tutors">) {
  return <ProtectedRoute allow={ALLOW}>{children}</ProtectedRoute>;
}
