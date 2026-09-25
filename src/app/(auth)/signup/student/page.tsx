import type { Metadata } from "next";
import { SignupShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Student Sign Up",
  description: "Create your NexTutorHub student account and find the right tutor near you.",
};

export default function StudentSignupPage() {
  return (
    <SignupShell>
      <SignupForm role="student" />
    </SignupShell>
  );
}
