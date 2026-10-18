import { api } from "../api-client";
import type { TuitionMode, TutorDetail, TutorSearchResult } from "@/types/api";

export type TutorSearchSort = "rating" | "feesAsc" | "feesDesc" | "experience";

export interface TutorSearchParams {
  page?: number;
  limit?: number;
  city?: string;
  area?: string;
  class?: string;
  board?: string;
  subject?: string;
  /** Matches tutors teaching ANY of these; sent comma-separated. */
  subjects?: string[];
  /** Same as maxFee; kept for existing callers. */
  budget?: number;
  minFee?: number;
  maxFee?: number;
  /** The mode the student wants: "home"/"online" also match tutors who teach both; "both" matches anyone. */
  teachingMode?: TuitionMode;
  sort?: TutorSearchSort;
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
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(","));
    } else if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const tutorsApi = {
  search: (params: TutorSearchParams = {}) =>
    // nearbyTotal: tutors within range ignoring the other filters (only for lat/lng searches).
    api.get<PaginatedResult<TutorSearchResult> & { nearbyTotal?: number }>(`/tutors/search${toQueryString(params)}`, {
      auth: false,
    }),
  /** Full profile for a signed-in student (contact number for verified tutors, distance from the saved location). */
  details: (id: string) => api.get<{ message: string; item: TutorDetail }>(`/tutors/${id}/details`),
  guestProfile: (id: string, lat?: number, lng?: number) =>
    api.get<{ message: string; item: TutorSearchResult }>(`/tutors/search/${id}${toQueryString({ lat, lng })}`, {
      auth: false,
    }),
};
