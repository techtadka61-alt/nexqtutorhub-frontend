import { Suspense } from "react";
import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your NexTutorHub account.",
  alternates: { canonical: "/login" },
  openGraph: pageOpenGraph("Sign In", "Sign in to your NexTutorHub account.", "/login"),
};

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
