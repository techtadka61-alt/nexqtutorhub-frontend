import type { Metadata } from "next";
import { FaqSection } from "@/components/marketing/FaqSection";
import { Container } from "@/components/ui/Container";
import { FindTutors } from "@/components/students/FindTutors";

export const metadata: Metadata = {
  title: "Find a Tutor",
  description: "Browse tutors matched to your class, subjects, board, location and budget.",
  // Signed-in students only: crawlers would just see the sign-in redirect.
  robots: { index: false, follow: false },
};

export default function FindTutorsPage() {
  return (
    <>
      <section className="bg-bg py-12 sm:py-16">
        <Container>
          <FindTutors />
        </Container>
      </section>
      <FaqSection />
    </>
  );
}
