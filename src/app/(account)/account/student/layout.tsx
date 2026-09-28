import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { UserRole } from "@/types/api";

const ALLOW = [UserRole.STUDENT];

/** Student dashboard only: any other signed-in role is sent to its own account home. */
export default function StudentAccountLayout({ children }: LayoutProps<"/account/student">) {
  return <ProtectedRoute allow={ALLOW}>{children}</ProtectedRoute>;
}
