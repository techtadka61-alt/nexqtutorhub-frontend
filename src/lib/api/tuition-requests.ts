import type { PickedLocation } from "@/lib/geolocation";
import { api } from "../api-client";
import type {
  Paginated,
  TuitionMode,
  TuitionRequest,
  TuitionRequestDetail,
  TutorTuitionRequestView,
} from "@/types/api";

export interface TuitionRequestPayload {
  studentClass: string;
  board?: string;
  subjects: string[];
  tuitionMode: TuitionMode;
  /** Required unless tuitionMode is "online". */
  city?: string;
  area?: string;
  fullAddress?: string;
  /** GPS position; required (here or on the student's profile) unless tuitionMode is "online". */
  location?: PickedLocation;
  budget?: number;
  schedule?: string;
  notes?: string;
  mobileNumber: string;
}

export interface OpenRequestQuery {
  page?: number;
  limit?: number;
  city?: string;
  subject?: string;
  tuitionMode?: "home" | "online";
}

function query(params: object) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") search.set(key, String(value));
  const text = search.toString();
  return text ? `?${text}` : "";
}

export const tuitionRequestsApi = {
  // student
  create: (payload: TuitionRequestPayload) =>
    api.post<{ message: string; item: TuitionRequest }>("/tuition-requests", payload),
  listMine: () => api.get<{ message: string; items: TuitionRequest[] }>("/tuition-requests/me"),
  getMine: (id: string) => api.get<{ message: string; item: TuitionRequestDetail }>(`/tuition-requests/me/${id}`),
  close: (id: string) => api.patch<{ message: string; item: TuitionRequest }>(`/tuition-requests/me/${id}/close`),
  accept: (id: string, applicationId: string) =>
    api.post<{ message: string; item: TuitionRequestDetail }>(`/tuition-requests/me/${id}/applications/${applicationId}/accept`),
  decline: (id: string, applicationId: string) =>
    api.post<{ message: string }>(`/tuition-requests/me/${id}/applications/${applicationId}/decline`),
  // tutor
  listOpen: (params: OpenRequestQuery) =>
    api.get<Paginated<TutorTuitionRequestView>>(`/tuition-requests/open${query(params)}`),
  apply: (id: string, message?: string) =>
    api.post<{ message: string; item: TutorTuitionRequestView }>(`/tuition-requests/${id}/applications`, { message }),
  listMyApplications: () =>
    api.get<{ message: string; items: TutorTuitionRequestView[] }>("/tuition-requests/applications/me"),
  withdraw: (applicationId: string) => api.patch<{ message: string }>(`/tuition-requests/applications/${applicationId}/withdraw`),
};
