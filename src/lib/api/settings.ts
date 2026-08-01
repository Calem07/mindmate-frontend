import { apiFetch, jsonBody } from "./client";

export type Settings = {
  notifications: { daily: boolean; streaks: boolean; lunaWhispers: boolean; weeklyRecap: boolean };
  privacy: { biometric: boolean; analytics: boolean; shareProgress: boolean };
  appearance: { theme: "dark" | "light" | "system"; reduceMotion: boolean };
};

export const settingsApi = {
  get: () => apiFetch<Settings>("/settings"),
  update: (input: Record<string, unknown>) =>
    apiFetch<Settings>("/settings", { method: "PATCH", body: jsonBody(input) }),
};
