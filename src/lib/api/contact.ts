import { api } from "../api-client";

export interface ContactMessagePayload {
  name: string;
  email: string;
  mobileNumber?: string;
  message: string;
  /** Honeypot: hidden from people, so it stays empty unless a bot fills it in. */
  website?: string;
}

export const contactApi = {
  send: (payload: ContactMessagePayload) => api.post<{ message: string }>("/contact", payload, { auth: false }),
};
