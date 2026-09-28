const KEY = "nth_return_to";

/** Only same-site paths ("/x", not "//evil.com" or "https://…"), so a stored/query path can't open-redirect. */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

/**
 * Remembers the page a guest was sent to login from, so they land there after signing in — even when they
 * first register and verify their email (the verification link usually opens in a new tab, losing `?next=`).
 * localStorage is per-browser, which is exactly the scope we want; every access is guarded for SSR/privacy modes.
 */
export const returnTo = {
  set(path: string) {
    try {
      if (safeReturnPath(path)) window.localStorage.setItem(KEY, path);
    } catch {}
  },
  get(): string | null {
    try {
      return safeReturnPath(window.localStorage.getItem(KEY));
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
