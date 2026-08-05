import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authApi } from "@/lib/api/auth";
import { clearStoredAuth, getStoredAuth, onUnauthorized, type StoredAuth } from "@/lib/api/client";

type ApiUser = {
  id: string;
  email: string;
  user_metadata: {
    display_name?: string;
    avatar_url?: string | null;
  };
};

type ApiSession = {
  access_token: string;
  expires_at: string;
  user: ApiUser;
};

type AuthState = { user: ApiUser | null; session: ApiSession | null; loading: boolean };
const AuthCtx = createContext<AuthState>({ user: null, session: null, loading: true });
const MAX_SESSION_MS = 3 * 60 * 60 * 1000;

function stateFromAuth(auth: StoredAuth | null): AuthState {
  if (!auth) return { user: null, session: null, loading: false };
  const user: ApiUser = {
    id: auth.user.id,
    email: auth.user.email,
    user_metadata: {
      display_name: auth.user.displayName,
      avatar_url: auth.user.avatarUrl,
    },
  };
  return {
    user,
    session: { access_token: auth.token, expires_at: auth.expiresAt, user },
    loading: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true });
  const navigate = useNavigate();

  useEffect(() => {
    let expiryTimer: number | undefined;
    const handleExpired = () => {
      if (expiryTimer !== undefined) window.clearTimeout(expiryTimer);
      clearStoredAuth();
      setState({ user: null, session: null, loading: false });
      void navigate({ to: "/", replace: true });
    };
    const sync = () => {
      const auth = authApi.current() ?? getStoredAuth();
      setState(stateFromAuth(auth));
      if (expiryTimer !== undefined) window.clearTimeout(expiryTimer);
      if (!auth) return;
      const tokenExpiry = Date.parse(auth.expiresAt);
      const delay = Math.min(
        Number.isFinite(tokenExpiry) ? tokenExpiry - Date.now() : MAX_SESSION_MS,
        MAX_SESSION_MS,
      );
      if (delay <= 0) handleExpired();
      else expiryTimer = window.setTimeout(handleExpired, delay);
    };
    window.addEventListener("mindmate-session-expired", handleExpired);
    window.addEventListener("mindmate-auth-changed", sync);
    onUnauthorized(sync);
    sync();
    return () => {
      onUnauthorized(null);
      window.removeEventListener("mindmate-session-expired", handleExpired);
      window.removeEventListener("mindmate-auth-changed", sync);
      if (expiryTimer !== undefined) window.clearTimeout(expiryTimer);
    };
  }, [navigate]);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
