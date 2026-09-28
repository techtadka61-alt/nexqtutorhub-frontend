import { api } from "../api-client";
import type { TuitionApplication, TuitionApplicationMode } from "@/types/api";

export interface TuitionApplicationPayload {
  fullName: string;
  mobileNumber: string;
  email: string;
  tuitionMode: TuitionApplicationMode;
  fullAddress: string;
  area: string;
  city: string;
  /** Exactly one of these: a new upload, or the id of a saved resume. */
  resume?: File;
  resumeId?: string;
}

export const tuitionApplicationsApi = {
  /** Multipart: text fields plus either the resume file under "resume" or a saved "resumeId". */
  apply: (payload: TuitionApplicationPayload) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(payload)) if (value !== undefined) form.append(key, value);
    return api.post<{ message: string; application: TuitionApplication }>("/tuition-applications", form);
  },
  listMine: () => api.get<{ message: string; items: TuitionApplication[] }>("/tuition-applications/me"),
};
