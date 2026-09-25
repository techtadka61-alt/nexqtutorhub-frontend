import { api } from "../api-client";
import type { LoginResponse, RegisterResponse, SafeUser, UserRole } from "@/types/api";

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
}

export type RegisterTutorPayload = RegisterStudentPayload;

export const authApi = {
  login: (payload: LoginPayload) => api.post<LoginResponse>("/auth/login", payload, { auth: false }),
  registerStudent: (payload: RegisterStudentPayload) =>
    api.post<RegisterResponse>("/students/register", payload, { auth: false }),
  registerTutor: (payload: RegisterTutorPayload) =>
    api.post<RegisterResponse>("/tutors/register", payload, { auth: false }),
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
