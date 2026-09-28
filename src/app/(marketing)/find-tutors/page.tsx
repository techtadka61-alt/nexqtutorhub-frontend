import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { FindTutors } from "@/components/students/FindTutors";

export const metadata: Metadata = {
  title: "Find a Tutor",
  description: "Browse tutors matched to your class, subjects, board, location and budget.",
};

export default function FindTutorsPage() {
  return (
    <section className="bg-bg py-12 sm:py-16">
      <Container>
        <FindTutors />
      </Container>
    </section>
  );
}
