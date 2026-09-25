import { api } from "../api-client";
import type { ProfileEnvelope, StudentProfile, TutorProfile, TuitionMode } from "@/types/api";

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
  pincode?: string;
  teachingExperienceYears?: number;
  highestQualification?: string;
  subjects?: string[];
  classes?: string[];
  boards?: string[];
  teachingMode?: TuitionMode;
  preferredRadiusKm?: number;
  fees?: number;
  availability?: string;
  resumeUrl?: string;
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

export const tutorResumeApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ProfileEnvelope<TutorProfile>>("/tutors/me/resume", form);
  },
};
