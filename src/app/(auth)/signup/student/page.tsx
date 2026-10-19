import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { SignupShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Student Sign Up — Find a Home Tutor in Sonbhadra",
  description: "Create your free NexTutorHub student account and get verified home tutors near you in Sonbhadra.",
  alternates: { canonical: "/signup/student" },
  openGraph: pageOpenGraph("Student Sign Up — Find a Home Tutor in Sonbhadra", "Create your free NexTutorHub student account and get verified home tutors near you in Sonbhadra.", "/signup/student"),
};

export default function StudentSignupPage() {
  return (
    <SignupShell>
      <SignupForm role="student" />
    </SignupShell>
  );
}
