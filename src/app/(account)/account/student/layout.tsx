import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { UserRole } from "@/types/api";

/** Everything under /account/student is for students only; other roles get an explanation instead. */
export default function StudentAccountLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allow={[UserRole.STUDENT]}>{children}</ProtectedRoute>;
}
