import type { Metadata } from "next";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { MyRequests } from "@/components/students/MyRequests";
import { FaqSection } from "@/components/marketing/FaqSection";
import { Container } from "@/components/ui/Container";
import { UserRole } from "@/types/api";

export const metadata: Metadata = {
  title: "My tuition requests",
  description: "See which tutors applied to your tuition requests and choose who to connect with.",
};

/** Kept on the public site (not the account dashboard) so students on phones stay in one familiar layout. */
export default function MyRequestsPage() {
  return (
    <ProtectedRoute allow={[UserRole.STUDENT]}>
      <section className="bg-bg py-8 sm:py-14">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Suspense fallback={null}>
              <MyRequests />
            </Suspense>
          </div>
        </Container>
      </section>
      <FaqSection />
    </ProtectedRoute>
  );
}
