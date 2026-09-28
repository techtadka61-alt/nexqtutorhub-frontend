import type { StudentProfile } from "@/types/api";

/** Where a student fills in their learning requirement; `setup=requirement` turns on the guided first-run mode. */
export const REQUIREMENT_SETUP_PATH = "/account/profile?setup=requirement";

type RequirementFields = Pick<StudentProfile, "studentClass" | "subjects" | "preferredTuitionMode" | "city">;

/**
 * What tutor matching needs from a student before the listing is useful: class, at least one subject,
 * a tuition mode, and a city unless they only want online tuition. Returns the missing field labels.
 */
export function missingRequirement(profile: Partial<RequirementFields> | null | undefined): string[] {
  const missing: string[] = [];
  if (!profile?.studentClass) missing.push("class");
  if (!profile?.subjects?.length) missing.push("subjects");
  if (!profile?.preferredTuitionMode) missing.push("tuition mode");
  if (profile?.preferredTuitionMode !== "online" && !profile?.city?.trim()) missing.push("city");
  return missing;
}
