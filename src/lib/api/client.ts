const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(
  /^VITE_API_BASE_URL=/,
  "",
);

export const API_BASE_URL = (configuredApiBaseUrl || "http://localhost:8080/api/v1").replace(
  /\/$/,
  "",
);

export const AUTH_STORAGE_KEY = "mindmate.auth";

export type StoredAuth = {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
    roles?: string[];
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let unauthorizedHandler: (() => void) | null = null;
let authInvalidated = false;

export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  if (authInvalidated) return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const auth = JSON.parse(raw) as StoredAuth;
    const expiresAt = Date.parse(auth.expiresAt);
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event("mindmate-session-expired"));
      return null;
    }
    return auth;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth) {
  authInvalidated = false;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  authInvalidated = true;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function isPublicApiPath(path: string) {
  return (
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/password/forgot" ||
    path === "/auth/password/reset" ||
    path === "/admin/auth/login"
  );
}

function notifyUnauthorized() {
  clearStoredAuth();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mindmate-session-expired"));
  }
  unauthorizedHandler?.();
}

function query(params?: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
    authRequired?: boolean;
  } = {},
): Promise<T> {
  const { authRequired, params, ...requestInit } = init;
  const auth = getStoredAuth();
  const requiresAuth = authRequired ?? !isPublicApiPath(path);
  if (requiresAuth && !auth?.token) {
    notifyUnauthorized();
    throw new ApiError("Session expired. Please sign in again.", 401);
  }
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  if (auth?.token) headers.set("Authorization", `Bearer ${auth.token}`);

  const response = await fetch(`${API_BASE_URL}${path}${query(init.params)}`, {
    ...requestInit,
    headers,
  });

  if (response.status === 401) {
    notifyUnauthorized();
  }

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message?: unknown }).message)
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, body);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value);
}
