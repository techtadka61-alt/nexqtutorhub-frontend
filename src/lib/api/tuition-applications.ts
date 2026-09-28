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
  resume: File;
}

export const tuitionApplicationsApi = {
  /** Multipart: text fields plus the resume file under "resume". */
  apply: (payload: TuitionApplicationPayload) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(payload)) form.append(key, value);
    return api.post<{ message: string; application: TuitionApplication }>("/tuition-applications", form);
  },
  listMine: () => api.get<{ message: string; items: TuitionApplication[] }>("/tuition-applications/me"),
};
