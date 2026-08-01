import {
  apiFetch,
  clearStoredAuth,
  getStoredAuth,
  jsonBody,
  setStoredAuth,
  type StoredAuth,
} from "./client";

export type AuthUser = StoredAuth["user"];
export type AuthResponse = StoredAuth;

type BackendAuthResponse = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

function store(response: BackendAuthResponse): AuthResponse {
  const auth = { token: response.token, expiresAt: response.expiresAt, user: response.user };
  setStoredAuth(auth);
  window.dispatchEvent(new Event("mindmate-auth-changed"));
  return auth;
}

export const authApi = {
  current: getStoredAuth,
  async register(input: { displayName: string; email: string; password: string }) {
    return store(
      await apiFetch<BackendAuthResponse>("/auth/register", {
        method: "POST",
        body: jsonBody(input),
      }),
    );
  },
  async login(input: { email: string; password: string }) {
    return store(
      await apiFetch<BackendAuthResponse>("/auth/login", { method: "POST", body: jsonBody(input) }),
    );
  },
  async adminLogin(input: { email: string; password: string }) {
    return store(
      await apiFetch<BackendAuthResponse>("/admin/auth/login", {
        method: "POST",
        body: jsonBody(input),
      }),
    );
  },
  forgotPassword: (input: { email: string; resetUrl?: string }) =>
    apiFetch<void>("/auth/password/forgot", { method: "POST", body: jsonBody(input) }),
  resetPassword: (input: { token: string; password: string }) =>
    apiFetch<void>("/auth/password/reset", { method: "POST", body: jsonBody(input) }),
  async me() {
    return apiFetch<AuthUser>("/auth/me");
  },
  logout() {
    clearStoredAuth();
    window.dispatchEvent(new Event("mindmate-auth-changed"));
  },
};
