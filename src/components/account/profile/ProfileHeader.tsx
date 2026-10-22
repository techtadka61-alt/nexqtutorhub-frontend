"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { notify } from "@/components/ui/Toast";
import { useAuth } from "@/context/auth-context";
import { profilePictureApi } from "@/lib/api/profile";
import { assetUrl } from "@/lib/config";
import type { Completion } from "@/lib/profile-completion";
import { UserRole } from "@/types/api";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_MB = 4;

const VERIFICATION: Record<string, { label: string; variant: "success" | "warning" | "error" }> = {
  verified: { label: "Verified tutor", variant: "success" },
  pending: { label: "Verification pending", variant: "warning" },
  rejected: { label: "Verification rejected", variant: "error" },
};

interface ProfileHeaderProps {
  completion: Completion | null;
  verificationStatus?: string;
  /** City/area line under the name. */
  locationLabel?: string;
  /** Called with the new picture path after a successful upload. */
  onPhotoChange?: (path: string | undefined) => void;
}

/** Cover band, photo (click to upload/replace), identity and a profile-strength meter. */
export function ProfileHeader({ completion, verificationStatus, locationLabel, onPhotoChange }: ProfileHeaderProps) {
  const { user, refreshUser } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Release the temporary object URL once it is replaced or the header unmounts.
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  // refreshUser() after an upload brings the new path; tell the page so its completion meter updates.
  const picture = user?.profilePicture ?? undefined;
  const lastPicture = useRef(picture);
  useEffect(() => {
    if (lastPicture.current === picture) return;
    lastPicture.current = picture;
    onPhotoChange?.(picture);
  }, [picture, onPhotoChange]);

  if (!user) return null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return notify.error("Please choose a JPEG, PNG or WEBP image.");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return notify.error(`Image is too large. Maximum size is ${MAX_IMAGE_MB}MB.`);
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      await profilePictureApi.upload(file);
      await refreshUser();
      notify.success("Profile photo updated.");
    } catch (err) {
      setPreview(null);
      notify.error(err, "Couldn't upload your photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  const photo = preview ?? assetUrl(user.profilePicture);

  const verification = user.role === UserRole.TUTOR && verificationStatus ? VERIFICATION[verificationStatus] : undefined;
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <Card id="overview" className="scroll-mt-6 overflow-hidden">
      <div className="relative h-28 bg-gradient-to-r from-brand-primary via-brand-primary to-brand-secondary sm:h-32">
        <svg className="absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden>
          <defs>
            <pattern id="profile-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#profile-dots)" />
        </svg>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative -mt-12 w-fit shrink-0">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-brand-secondary-light ring-4 ring-surface sm:h-28 sm:w-28">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- uploads live on the API origin
                <img src={photo} alt={`${user.fullName}'s profile photo`} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-brand-primary">
                  {initials(user.fullName)}
                </span>
              )}
              {isUploading && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={isUploading}
              aria-label={photo ? "Change profile photo" : "Upload profile photo"}
              className="absolute bottom-0.5 right-0.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-brand-secondary text-white shadow-soft transition-colors hover:bg-brand-primary disabled:cursor-not-allowed focus-ring"
            >
              <CameraIcon />
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          <div className="min-w-0 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-brand-primary">{user.fullName}</h1>
              {verification && <Badge variant={verification.variant}>{verification.label}</Badge>}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <MailIcon />
                {user.email}
              </span>
              {user.mobileNumber && (
                <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon />
                  +91 {user.mobileNumber}
                </span>
              )}
              {locationLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <PinIcon />
                  {locationLabel}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              {user.role === UserRole.TUTOR ? "Tutor" : "Student"} account · Member since {memberSince}
            </p>
          </div>
        </div>

        {completion && <StrengthMeter completion={completion} />}
      </div>
    </Card>
  );
}

function StrengthMeter({ completion }: { completion: Completion }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const next = completion.missing[0];
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-bg px-4 py-3 lg:min-w-72">
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={completion.percent === 100 ? "var(--color-success)" : "var(--color-brand-secondary)"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - completion.percent / 100)}
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
          {completion.percent}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">Profile strength</p>
        {next ? (
          <p className="mt-0.5 text-xs text-text-secondary">
            Next:{" "}
            <a href={`#${next.section}`} className="font-semibold text-brand-secondary hover:text-brand-primary">
              add {next.label.toLowerCase()}
            </a>
            {completion.missing.length > 1 && ` +${completion.missing.length - 1} more`}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-success-strong">Your profile is complete.</p>
        )}
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "U";
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8a2 2 0 012-2h1.5l1.2-1.8A2 2 0 0110.4 3h3.2a2 2 0 011.7.9L16.5 6H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8Z" strokeLinejoin="round" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
