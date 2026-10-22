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

/** A new access token, null when the session is over, or "unavailable" when the refresh couldn't be done right now. */
type RefreshResult = string | null | "unavailable";

let refreshPromise: Promise<RefreshResult> | null = null;

/**
 * Runs the refresh under a lock shared by every tab of the site (Web Locks). Each refresh rotates the refresh
 * token, so two tabs refreshing at once (e.g. tabs restored together after the access token expired) would have
 * one of them present the already-rotated token, get a 401 and clear the session for all tabs. Browsers without
 * Web Locks just refresh per tab, as before.
 */
async function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) return await navigator.locks.request("nth-token-refresh", fn);
  return fn();
}

/** `rejectedToken` is the access token the server just refused (null if the request carried none). */
async function refreshAccessToken(rejectedToken: string | null): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = withRefreshLock(async () => {
      // Another tab refreshed while this one waited for the lock: use its new token rather than spending ours.
      const current = tokenStorage.getAccessToken();
      if (current && current !== rejectedToken) return current;
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        // An access token the server rejected, and nothing to renew it with: the session is over.
        if (current) expireSession();
        return null;
      }
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
          if (res.status === 401 || res.status === 403) {
            expireSession();
            return null;
          }
          return "unavailable";
        }
        if (superseded) return tokenStorage.getAccessToken();
        const json = (await res.json()) as ApiEnvelope<AuthTokens>;
        tokenStorage.setTokens(json.data.accessToken, json.data.refreshToken ?? refreshToken);
        return json.data.accessToken;
      } catch {
        // Network failure: the session may be fine.
        return "unavailable";
      }
    }).finally(() => {
      refreshPromise = null;
    });
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

  const token = auth ? tokenStorage.getAccessToken() : null;
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders, body: finalBody });

  if (res.status === 401 && auth && !_isRetry) {
    const newToken = await refreshAccessToken(token);
    if (newToken === "unavailable")
      // Not the 401 itself: callers (e.g. the session check) treat a 401 as "signed out" and would drop the tokens.
      throw new ApiError("Couldn't reach the server. Please try again.", 503, [], {});
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
