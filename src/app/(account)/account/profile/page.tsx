"use client";

import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/api";
import { StudentProfileForm } from "@/components/account/StudentProfileForm";
import { TutorProfileForm } from "@/components/account/TutorProfileForm";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-primary">My profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {user?.role === UserRole.TUTOR
            ? "Keep your teaching profile accurate so students can find and trust you."
            : "Keep your requirement accurate so tutors can find and reach out to you."}
        </p>
      </div>

      {user?.role === UserRole.TUTOR ? <TutorProfileForm /> : <StudentProfileForm />}
    </div>
  );
}
