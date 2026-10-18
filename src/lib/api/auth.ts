import type { PickedLocation } from "@/lib/geolocation";
import { api } from "../api-client";
import type { GoogleAuthResponse, LoginResponse, RegisterResponse, SafeUser, UserRole } from "@/types/api";

export interface LoginPayload {
  email: string;
  password: string;
  /** Optional: omit to sign in with whatever role the account has. */
  role?: UserRole;
}

export interface RegisterStudentPayload {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  /** Optional GPS position captured at signup. */
  location?: PickedLocation;
}

export type RegisterTutorPayload = RegisterStudentPayload;

export interface GoogleAuthPayload {
  /** Firebase ID token from the Google popup. */
  idToken: string;
  /** Existing account: must have this role. New account: the role to create. */
  role?: UserRole.STUDENT | UserRole.TUTOR;
  /** New accounts only (sent from the finish-signing-up form). */
  fullName?: string;
  mobileNumber?: string;
  /** Full address (house / street, area, city); private. */
  address?: string;
  termsAccepted?: boolean;
  location?: PickedLocation;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post<LoginResponse>("/auth/login", payload, { auth: false }),
  registerStudent: (payload: RegisterStudentPayload) =>
    api.post<RegisterResponse>("/students/register", payload, { auth: false }),
  registerTutor: (payload: RegisterTutorPayload) =>
    api.post<RegisterResponse>("/tutors/register", payload, { auth: false }),
  google: (payload: GoogleAuthPayload) => api.post<GoogleAuthResponse>("/auth/google", payload, { auth: false }),
  me: () => api.get<SafeUser>("/auth/me"),
  logout: () => api.post<{ message: string }>("/auth/logout"),
  forgotPassword: (email: string) =>
    api.post<{ message: string; resetToken?: string }>("/auth/forgot-password", { email }, { auth: false }),
  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, password }, { auth: false }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ message: string }>("/auth/change-password", { currentPassword, newPassword }),
  sendVerificationEmail: (email: string) =>
    api.post<{ message: string; verificationToken?: string }>(
      "/auth/send-verification-email",
      { email },
      { auth: false },
    ),
  verifyEmail: (token: string) =>
    api.post<{ message: string }>("/auth/verify-email", { token }, { auth: false }),
  deactivate: () => api.delete<{ message: string }>("/auth/me"),
};
