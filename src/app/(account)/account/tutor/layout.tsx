import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { UserRole } from "@/types/api";

const ALLOW = [UserRole.TUTOR];

/** Tutor dashboard only: any other signed-in role is sent to its own account home. */
export default function TutorAccountLayout({ children }: LayoutProps<"/account/tutor">) {
  return <ProtectedRoute allow={ALLOW}>{children}</ProtectedRoute>;
}
