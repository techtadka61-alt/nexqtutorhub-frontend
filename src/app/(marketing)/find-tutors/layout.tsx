import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { UserRole } from "@/types/api";

const ALLOW = [UserRole.STUDENT];

/** Students only (listing and tutor detail): guests go to login/register first and come back here. */
export default function FindTutorsLayout({ children }: LayoutProps<"/find-tutors">) {
  return <ProtectedRoute allow={ALLOW}>{children}</ProtectedRoute>;
}
