import type { TuitionRequestPayload } from "./api/tuition-requests";

const KEY = "nth_request_draft";

/** The tuition-request form state; numbers stay strings while being edited. */
export type RequestDraft = Omit<TuitionRequestPayload, "budget" | "tuitionMode"> & {
  tuitionMode: TuitionRequestPayload["tuitionMode"] | "";
  budget: string;
};

/**
 * A guest's filled-in tuition request, kept while they register, verify their email (often in another tab) and
 * sign in, so it can be submitted for them on return. localStorage, guarded like `returnTo`.
 */
export const requestDraft = {
  save(draft: RequestDraft) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(draft));
    } catch {}
  },
  get(): RequestDraft | null {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as RequestDraft) : null;
    } catch {
      return null;
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {}
  },
};
