import { apiFetch, jsonBody } from "./client";

export type Profile = {
  name: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  level: number;
  xp: number;
  xpToNext: number;
  bondPct: number;
  bond: number;
  streakDays: number;
  joinedAt: string;
  timezone: string;
};

export const profileApi = {
  get: () => apiFetch<Profile>("/me/profile"),
  update: (input: Partial<Pick<Profile, "displayName" | "avatarUrl" | "timezone" | "bond">>) =>
    apiFetch<Profile>("/me/profile", { method: "PATCH", body: jsonBody(input) }),
};
