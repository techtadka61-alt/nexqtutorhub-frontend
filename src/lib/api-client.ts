import { API_URL } from "./config";
import { tokenStorage } from "./token-storage";
import type { ApiEnvelope, AuthTokens } from "@/types/api";

export class ApiError extends Error {
  statusCode: number;
  details: string[];
  /** Server-side validation errors keyed by field name, e.g. { email: "Please enter a valid email address…" }. */
  fieldErrors: Record<string, string>;
  constructor(message: string, statusCode: number, details: string[] = [], fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  /** Set automatically after one retry to avoid infinite refresh loops. */
  _isRetry?: boolean;
}

/**
 * Fired on `window` when the session can no longer be renewed (refresh token expired, revoked or missing).
 * Tokens are already cleared by then; AuthProvider listens and signs the user out of the UI.
 */
export const SESSION_EXPIRED_EVENT = "nth:session-expired";

function expireSession() {
  tokenStorage.clear();
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    // An access token the server rejected, and nothing to renew it with: the session is over.
    if (tokenStorage.getAccessToken()) expireSession();
    return null;
  }
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        // If someone logged in/out while this was in flight, the stored tokens belong to a newer session:
        // leave them alone rather than clobbering them with (or clearing them for) the old account.
        const superseded = tokenStorage.getRefreshToken() !== refreshToken;
        if (!res.ok) {
          if (superseded) return tokenStorage.getAccessToken();
          // Only a rejected refresh token ends the session; a 5xx/429 is transient and must not log anyone out.
          if (res.status === 401 || res.status === 403) expireSession();
          return null;
        }
        if (superseded) return tokenStorage.getAccessToken();
        const json = (await res.json()) as ApiEnvelope<AuthTokens>;
        tokenStorage.setTokens(json.data.accessToken, json.data.refreshToken ?? refreshToken);
        return json.data.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, _isRetry, ...rest } = options;
  const finalHeaders = new Headers(headers);
  let finalBody: BodyInit | undefined;

  if (body !== undefined) {
    if (isFormData(body)) {
      finalBody = body;
    } else {
      finalHeaders.set("Content-Type", "application/json");
      finalBody = JSON.stringify(body);
    }
  }

  if (auth) {
    const token = tokenStorage.getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders, body: finalBody });

  if (res.status === 401 && auth && !_isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiRequest<T>(path, { ...options, _isRetry: true });
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.message;
    const text = Array.isArray(message) ? message.join(", ") : message ?? "Something went wrong. Please try again.";
    throw new ApiError(text, res.status, Array.isArray(message) ? message : [], json?.errors ?? {});
  }

  return (json as ApiEnvelope<T>).data;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: "DELETE" }),
};
