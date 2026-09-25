import { API_URL } from "./config";
import { tokenStorage } from "./token-storage";
import type { ApiEnvelope, AuthTokens } from "@/types/api";

export class ApiError extends Error {
  statusCode: number;
  details: string[];
  constructor(message: string, statusCode: number, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  /** Set automatically after one retry to avoid infinite refresh loops. */
  _isRetry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          tokenStorage.clear();
          return null;
        }
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
    throw new ApiError(text, res.status, Array.isArray(message) ? message : []);
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
