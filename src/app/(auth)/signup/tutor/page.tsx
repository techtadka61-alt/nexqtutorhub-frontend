import type { Metadata } from "next";
import { SignupShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Tutor Sign Up",
  description: "Create your NexTutorHub tutor account and start teaching students near you.",
};

export default function TutorSignupPage() {
  return (
    <SignupShell>
      <SignupForm role="tutor" />
    </SignupShell>
  );
}
