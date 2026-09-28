import { api } from "../api-client";
import type { TuitionMode, TutorSearchResult } from "@/types/api";

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
    api.get<PaginatedResult<TutorSearchResult>>(`/tutors/search${toQueryString(params)}`, { auth: false }),
  guestProfile: (id: string, lat?: number, lng?: number) =>
    api.get<{ message: string; item: TutorSearchResult }>(`/tutors/search/${id}${toQueryString({ lat, lng })}`, {
      auth: false,
    }),
};
