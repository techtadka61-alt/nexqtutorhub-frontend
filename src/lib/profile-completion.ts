import type { StudentProfile, TutorProfile } from "@/types/api";

export interface Completion {
  percent: number;
  /** Labels of what is still missing, most useful first. */
  missing: { label: string; section: string }[];
}

type Check = { label: string; section: string; done: boolean };

function summarize(checks: Check[]): Completion {
  const done = checks.filter((check) => check.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((check) => !check.done).map(({ label, section }) => ({ label, section })),
  };
}

const filled = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "";

/** What makes a tutor profile discoverable and trustworthy; `section` is the anchor id on the profile page. */
export function tutorCompletion(profile: TutorProfile): Completion {
  return summarize([
    { label: "Profile photo", section: "overview", done: filled(profile.userId.profilePicture) },
    { label: "Teaching location", section: "location", done: filled(profile.location) },
    { label: "City & area", section: "location", done: filled(profile.city) && filled(profile.area) },
    { label: "Teaching mode", section: "location", done: filled(profile.teachingMode) },
    { label: "Subjects", section: "teaching", done: filled(profile.subjects) },
    { label: "Classes", section: "teaching", done: filled(profile.classes) },
    { label: "Qualification", section: "teaching", done: filled(profile.highestQualification) },
    { label: "About you", section: "teaching", done: filled(profile.bio) },
    { label: "Experience", section: "teaching", done: filled(profile.teachingExperienceYears) },
    { label: "Monthly fees", section: "teaching", done: filled(profile.fees) },
    { label: "Time slots", section: "availability", done: filled(profile.availabilitySlots) },
    { label: "Resume", section: "resume", done: filled(profile.resumes) || filled(profile.resumeUrl) },
  ]);
}

export function studentCompletion(profile: StudentProfile): Completion {
  return summarize([
    { label: "Profile photo", section: "overview", done: filled(profile.userId.profilePicture) },
    { label: "Tuition location", section: "location", done: filled(profile.location) },
    { label: "City & area", section: "location", done: filled(profile.city) && filled(profile.area) },
    { label: "Class", section: "learning", done: filled(profile.studentClass) },
    { label: "Board", section: "learning", done: filled(profile.board) },
    { label: "Subjects", section: "learning", done: filled(profile.subjects) },
    { label: "Tuition mode", section: "learning", done: filled(profile.preferredTuitionMode) },
    { label: "Budget", section: "learning", done: filled(profile.budget) },
  ]);
}
