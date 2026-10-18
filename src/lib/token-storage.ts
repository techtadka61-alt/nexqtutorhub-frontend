const ACCESS_KEY = "nth_access_token";
const REFRESH_KEY = "nth_refresh_token";

/** Thin wrapper around localStorage so auth state survives a refresh; guarded for SSR where window is undefined. */
export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  setAccessToken(accessToken: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
  /** When the session truly ends: the refresh token's `exp` (ms since epoch), or null if unknown/absent. */
  refreshExpiresAt(): number | null {
    return jwtExpiry(this.getRefreshToken());
  },
  /** localStorage keys, for `storage` events fired by other tabs. */
  keys: { access: ACCESS_KEY, refresh: REFRESH_KEY },
};

/** Reads `exp` from a JWT without verifying it — only used to schedule the client-side logout. */
function jwtExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
