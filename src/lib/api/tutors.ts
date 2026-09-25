import { api } from "../api-client";
import type { TuitionMode, TutorProfile } from "@/types/api";

export interface TutorSearchParams {
  page?: number;
  limit?: number;
  city?: string;
  area?: string;
  class?: string;
  subject?: string;
  budget?: number;
  teachingMode?: TuitionMode;
  lat?: number;
  lng?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function toQueryString(params: object): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const tutorsApi = {
  search: (params: TutorSearchParams = {}) =>
    api.get<PaginatedResult<TutorProfile>>(`/tutors/search${toQueryString(params)}`, { auth: false }),
  guestProfile: (id: string, lat?: number, lng?: number) =>
    api.get<TutorProfile>(`/tutors/search/${id}${toQueryString({ lat, lng })}`, { auth: false }),
};
