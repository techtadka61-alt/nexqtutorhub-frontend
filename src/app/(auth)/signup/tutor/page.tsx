import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { SignupShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Tutor Sign Up — Teach Home Tuition in Sonbhadra",
  description: "Create your free NexTutorHub tutor account and start getting home-tuition students near you in Sonbhadra.",
  alternates: { canonical: "/signup/tutor" },
  openGraph: pageOpenGraph("Tutor Sign Up — Teach Home Tuition in Sonbhadra", "Create your free NexTutorHub tutor account and start getting home-tuition students near you in Sonbhadra.", "/signup/tutor"),
};

export default function TutorSignupPage() {
  return (
    <SignupShell>
      <SignupForm role="tutor" />
    </SignupShell>
  );
}
