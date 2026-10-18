import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { UserRole } from "@/types/api";

/** Everything under /account/tutor is for tutors only; other roles get an explanation instead. */
export default function TutorAccountLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allow={[UserRole.TUTOR]}>{children}</ProtectedRoute>;
}
