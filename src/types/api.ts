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
  /** Present on DTO validation failures: field name -> message. */
  errors?: Record<string, string>;
  timestamp: string;
}

export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  /** Backend-relative upload path, or a full Google photo URL; null when there is none. Pass through assetUrl(). */
  profilePicture?: string | null;
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

/** POST /auth/google: signed in (existing account, or a new one just created), or more details needed first. */
export type GoogleAuthResponse =
  | (LoginResponse & { status: "signed_in"; isNewUser: boolean })
  | {
      status: "registration_required";
      message: string;
      /** From the Google account, to prefill the finish-signing-up form. */
      profile: { email: string; fullName: string; picture?: string };
    };

export interface RegisterResponse {
  message: string;
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
  location?: GeoPoint;
  locationMeta?: LocationMeta;
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

/**
 * GET /tutors/:id/details — a tutor's full profile as a signed-in student sees it. `contactNumber` is present only
 * for verified tutors. Never includes the tutor's address, coordinates, resume or email.
 */
export interface TutorDetail extends TutorSearchResult {
  gender?: string;
  bio?: string;
  qualificationDetails?: string;
  languages: string[];
  availabilitySlots: AvailabilitySlot[];
  verifiedAt?: string;
  memberSince?: string;
  contactNumber?: string;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

/** How a saved location was found, kept beside it by the API. */
export interface LocationMeta {
  source?: "gps" | "address_search" | "map_pin";
  accuracyMeters?: number;
  address?: string;
  confirmedAt?: string;
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
  qualificationDetails?: string;
  bio?: string;
  languages?: string[];
  subjects?: string[];
  classes?: string[];
  boards?: string[];
  teachingMode?: TuitionMode;
  fees?: number;
  availability?: string;
  availabilitySlots?: AvailabilitySlot[];
  resumeUrl?: string;
  resumes?: TutorResume[];
  verificationStatus: "pending" | "verified" | "rejected" | string;
  /** Admin's reason for the last verification decision (mainly on rejection). */
  verificationNote?: string;
  rating?: number;
  location?: GeoPoint;
  locationMeta?: LocationMeta;
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

export type TuitionRequestStatus = "open" | "matched" | "closed";
export type TuitionRequestApplicationStatus = "pending" | "accepted" | "declined" | "withdrawn";

/** A student's own tuition request (GET /tuition-requests/me). */
export interface TuitionRequest {
  _id: string;
  studentFirstName: string;
  studentClass: string;
  board?: string;
  subjects: string[];
  tuitionMode: TuitionMode;
  city?: string;
  area?: string;
  fullAddress?: string;
  budget?: number;
  schedule?: string;
  notes?: string;
  mobileNumber: string;
  status: TuitionRequestStatus;
  applicationCount: number;
  /** Tutors who were notified when the request was posted. */
  notifiedTutorCount?: number;
  /** Only on the list endpoint. */
  pendingApplicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** A tutor's application as the student sees it; `contact` is present only once accepted. */
export interface TuitionRequestApplicant {
  _id: string;
  status: TuitionRequestApplicationStatus;
  message?: string;
  createdAt: string;
  tutor: TutorSearchResult | null;
  contact?: { fullName: string; email: string; mobileNumber: string };
}

export interface TuitionRequestDetail extends TuitionRequest {
  applications: TuitionRequestApplicant[];
}

/**
 * A request as a tutor sees it: the requirement, area, distance and the student's mobile number (while the request
 * is open). Full name, email and full address only once the tutor's application is accepted.
 */
export interface TutorTuitionRequestView {
  _id: string;
  studentFirstName: string;
  studentClass: string;
  board?: string;
  subjects: string[];
  tuitionMode: TuitionMode;
  city?: string;
  area?: string;
  /** Distance from the tutor's saved location, in km. */
  distanceKm?: number;
  budget?: number;
  schedule?: string;
  notes?: string;
  /** The student's contact number; present while the request is open (or once this tutor is accepted). */
  mobileNumber?: string;
  status: TuitionRequestStatus;
  applicationCount: number;
  createdAt: string;
  myApplication?: { _id: string; status: TuitionRequestApplicationStatus; message?: string; createdAt: string };
  contact?: { fullName: string; email?: string; mobileNumber: string; fullAddress?: string };
}

export interface Paginated<T> {
  message: string;
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export type NotificationType =
  | "tuition_request.nearby"
  | "tuition_request.application"
  | "tuition_request.accepted"
  | "tutor.nearby";

export interface AppNotification {
  _id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Web-app path to open when the notification is clicked. */
  link?: string;
  data?: { requestId?: string; applicationId?: string; distanceKm?: number };
  readAt: string | null;
  createdAt: string;
}
