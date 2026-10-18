import type { Metadata } from "next";
import { StudentRequestsBoard } from "@/components/tutors/StudentRequestsBoard";

export const metadata: Metadata = {
  title: "Student requests",
};

export default function TutorStudentRequestsPage() {
  return <StudentRequestsBoard />;
}
