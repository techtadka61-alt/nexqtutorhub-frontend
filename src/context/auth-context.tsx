"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, type GoogleAuthPayload, type LoginPayload } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/token-storage";
import { returnTo } from "@/lib/return-to";
import { ApiError, SESSION_EXPIRED_EVENT } from "@/lib/api-client";
import { ADMIN_PANEL_URL } from "@/lib/config";
import { notify } from "@/components/ui/Toast";
import { UserRole, type GoogleAuthResponse, type SafeUser } from "@/types/api";

interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean;
  /** True right after the user chose to log out, so route guards send them to plain /login (no `next`). */
  didLogout: boolean;
  /** Resolves with the signed-in user and the API's message (for the success toast). */
  login: (payload: LoginPayload) => Promise<{ user: SafeUser; message: string }>;
  /** "Continue with Google": starts the session when the API signs the user in; otherwise returns what it needs. */
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<GoogleAuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [didLogout, setDidLogout] = useState(false);
  // No stored token means there's nothing to fetch, so skip the loading state entirely instead
  // of flipping it off synchronously inside an effect on the very first render.
  const [isLoading, setIsLoading] = useState(() => !!tokenStorage.getAccessToken());
  const router = useRouter();
  // Bumped on every login/logout. A /me request started under an earlier session must not overwrite the
  // user of a newer one (e.g. a slow session check for the old account resolving after a fresh login).
  const sessionRef = useRef(0);

  const refreshUser = useCallback(async () => {
    const session = sessionRef.current;
    if (!tokenStorage.getAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      if (session === sessionRef.current) setUser(me);
    } catch (error) {
      if (session !== sessionRef.current) return;
      if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
        tokenStorage.clear();
      }
      setUser(null);
    } finally {
      if (session === sessionRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tokenStorage.getAccessToken()) return;
    // Wrapped in an async IIFE rather than calling refreshUser() directly: this reads as
    // subscribing to an external system's result (the session-check request) rather than an
    // effect body calling setState synchronously on mount.
    (async () => {
      await refreshUser();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * The session ended without the user logging out (refresh token expired or revoked). Tokens are already
   * gone; drop the user so every guard and menu reacts. Protected pages then send them to login with `next`.
   */
  const userRef = useRef<SafeUser | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const endExpiredSession = useCallback(() => {
    sessionRef.current += 1;
    tokenStorage.clear();
    setIsLoading(false);
    if (userRef.current) notify.info("Your session has expired. Please log in again.", { toastId: "session-expired" });
    setUser(null);
  }, []);

  // Fired by the API client when a refresh is refused.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, endExpiredSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, endExpiredSession);
  }, [endExpiredSession]);

  // Without this, an idle tab keeps showing the user as signed in long after the session ended, because nothing
  // calls the API to find out. Log out exactly when the refresh token expires, and re-check when the tab is
  // shown again (timers are throttled or paused while a laptop sleeps).
  useEffect(() => {
    if (!user) return;
    let timer: number | undefined;
    // Reads the stored token every time: each refresh rotates it and pushes the expiry out (sliding session).
    const check = () => {
      window.clearTimeout(timer);
      const expiresAt = tokenStorage.refreshExpiresAt();
      if (expiresAt === null) return;
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) return endExpiredSession();
      // setTimeout overflows above ~24.8 days; it just re-checks then.
      timer = window.setTimeout(check, Math.min(remaining, 2_147_483_647));
    };
    check();
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, endExpiredSession]);

  // Logging in or out in another tab changes localStorage there; mirror it here.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== tokenStorage.keys.refresh && e.key !== null) return;
      if (!tokenStorage.getRefreshToken()) {
        sessionRef.current += 1;
        setUser(null);
      } else if (e.oldValue === null) {
        void refreshUser();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshUser]);

  const startSession = useCallback((result: { accessToken: string; refreshToken: string; user: SafeUser }) => {
    sessionRef.current += 1;
    tokenStorage.setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
    setDidLogout(false);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authApi.login(payload);
      startSession(result);
      return { user: result.user, message: result.message };
    },
    [startSession],
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleAuthPayload) => {
      const result = await authApi.google(payload);
      if (result.status === "signed_in") startSession(result);
      return result;
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    // A deliberate logout with an already-dead session must not also announce "session expired".
    userRef.current = null;
    try {
      await authApi.logout();
    } catch {
      // Ignore network/auth errors on logout — we clear local state regardless.
    }
    sessionRef.current += 1;
    tokenStorage.clear();
    returnTo.clear();
    setDidLogout(true);
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, didLogout, login, loginWithGoogle, logout, refreshUser }),
    [user, isLoading, didLogout, login, loginWithGoogle, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleHomePath(role: UserRole): string {
  if (role === UserRole.STUDENT) return "/account/student";
  if (role === UserRole.TUTOR) return "/account/tutor";
  // Admins work in the separate admin panel app.
  return ADMIN_PANEL_URL;
}
