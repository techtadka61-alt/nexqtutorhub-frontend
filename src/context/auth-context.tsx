"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, type LoginPayload } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/token-storage";
import { ApiError } from "@/lib/api-client";
import { UserRole, type SafeUser } from "@/types/api";

interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<SafeUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  // No stored token means there's nothing to fetch, so skip the loading state entirely instead
  // of flipping it off synchronously inside an effect on the very first render.
  const [isLoading, setIsLoading] = useState(() => !!tokenStorage.getAccessToken());
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch (error) {
      if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
        tokenStorage.clear();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
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

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authApi.login(payload);
    tokenStorage.setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network/auth errors on logout — we clear local state regardless.
    }
    tokenStorage.clear();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshUser }),
    [user, isLoading, login, logout, refreshUser],
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
  return "/dashboard";
}
