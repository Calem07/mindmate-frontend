import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/lib/api/auth";
import { getStoredAuth, onUnauthorized, type StoredAuth } from "@/lib/api/client";

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

  useEffect(() => {
    const sync = () => setState(stateFromAuth(authApi.current() ?? getStoredAuth()));
    sync();
    onUnauthorized(sync);
    window.addEventListener("mindmate-auth-changed", sync);
    return () => {
      onUnauthorized(null);
      window.removeEventListener("mindmate-auth-changed", sync);
    };
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
