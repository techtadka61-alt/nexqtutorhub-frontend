import { api } from "../api-client";
import type { ProfileEnvelope, StudentProfile, TutorProfile, TutorResume, TuitionMode, AvailabilitySlot } from "@/types/api";

export interface UpdateStudentProfilePayload {
  fullName?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  city?: string;
  area?: string;
  pincode?: string;
  studentClass?: string;
  board?: string;
  subjects?: string[];
  preferredTuitionMode?: TuitionMode;
  budget?: number;
  availability?: string;
  guardianName?: string;
  guardianMobileNumber?: string;
  guardianEmail?: string;
}

export interface UpdateTutorProfilePayload {
  fullName?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  area?: string;
  address?: string;
  pincode?: string;
  teachingExperienceYears?: number;
  highestQualification?: string;
  subjects?: string[];
  classes?: string[];
  boards?: string[];
  teachingMode?: TuitionMode;
  preferredRadiusKm?: number;
  fees?: number;
  availabilitySlots?: AvailabilitySlot[];
  location?: { lat: number; lng: number };
}

export const studentProfileApi = {
  getMine: () => api.get<ProfileEnvelope<StudentProfile>>("/students/me"),
  updateMine: (payload: UpdateStudentProfilePayload) =>
    api.patch<ProfileEnvelope<StudentProfile>>("/students/me", payload),
};

export const tutorProfileApi = {
  getMine: () => api.get<ProfileEnvelope<TutorProfile>>("/tutors/me"),
  updateMine: (payload: UpdateTutorProfilePayload) =>
    api.patch<ProfileEnvelope<TutorProfile>>("/tutors/me", payload),
};

export const profilePictureApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<Record<string, unknown>>("/profile/me/picture", form);
  },
};

/** The tutor's saved resumes; every call returns the updated list, newest first. */
export const tutorResumeApi = {
  list: () => api.get<{ message: string; items: TutorResume[] }>("/tutors/me/resumes"),
  add: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<{ message: string; items: TutorResume[] }>("/tutors/me/resumes", form);
  },
  remove: (resumeId: string) =>
    api.delete<{ message: string; items: TutorResume[] }>(`/tutors/me/resumes/${resumeId}`),
};
