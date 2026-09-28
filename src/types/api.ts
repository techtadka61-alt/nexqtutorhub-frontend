export enum UserRole {
  SUPER_ADMIN = 1,
  STUDENT = 2,
  TUTOR = 3,
}

export type TuitionMode = "home" | "online" | "both";

export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** One weekly teaching window; times are 24-hour "HH:mm". */
export interface AvailabilitySlot {
  days: WeekDay[];
  from: string;
  to: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  method: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  method: string;
  message: string | string[];
  timestamp: string;
}

export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  message: string;
  user: SafeUser;
}

export interface RegisterResponse {
  userId: string;
  user: SafeUser;
  verificationToken?: string;
}

/** The `userId` field is populated by the backend with a subset of the account document. */
export interface PopulatedAccount {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  profilePicture?: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface StudentProfile {
  _id: string;
  userId: PopulatedAccount;
  termsAccepted: boolean;
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
  createdAt?: string;
  updatedAt?: string;
}

/** Guest-safe tutor card returned by GET /tutors/search (no contact details or exact address). */
export interface TutorSearchResult {
  id: string;
  name?: string;
  profilePhoto?: string;
  subjects?: string[];
  classes?: string[];
  boards?: string[];
  availability?: string;
  qualification?: string;
  experienceYears?: number;
  rating: number;
  distanceKm?: number;
  area?: string;
  city?: string;
  teachingMode?: TuitionMode;
  /** Monthly fee in ₹. */
  feeRange?: number;
  isVerified: boolean;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

/** One CV in a tutor's saved-resume library (GET /tutors/me/resumes). */
export interface TutorResume {
  _id: string;
  url: string;
  originalName: string;
  uploadedAt: string;
}

export interface TutorProfile {
  _id: string;
  userId: PopulatedAccount;
  termsAccepted: boolean;
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
  availability?: string;
  availabilitySlots?: AvailabilitySlot[];
  resumeUrl?: string;
  resumes?: TutorResume[];
  verificationStatus: "pending" | "verified" | "rejected" | string;
  rating?: number;
  location?: GeoPoint;
  createdAt?: string;
  updatedAt?: string;
}

/** Response shape of GET /students/me and GET /tutors/me (and PATCH .../me). */
export interface ProfileEnvelope<T> {
  message: string;
  item: T;
}

export type TuitionApplicationMode = "home" | "online" | "other";
export type TuitionApplicationStatus = "pending" | "reviewed" | "approved" | "rejected";

export interface TuitionApplication {
  _id: string;
  userId: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  tuitionMode: TuitionApplicationMode;
  resumeUrl: string;
  resumeOriginalName: string;
  fullAddress: string;
  area: string;
  city: string;
  status: TuitionApplicationStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}
