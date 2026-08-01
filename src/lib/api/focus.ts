import { apiFetch, jsonBody } from "./client";

export type FocusPreset = { id: string; label: string; focus: number; brk: number };
export type FocusSession = {
  id: string;
  subject: string;
  duration: number;
  completed: boolean;
  date: string;
  sessionDate?: string;
};

export const focusApi = {
  presets: () => apiFetch<FocusPreset[]>("/focus/presets"),
  sessions: (params?: { from?: string; to?: string; limit?: number }) =>
    apiFetch<FocusSession[]>("/focus/sessions", { params }),
  createSession: (input: {
    subject: string;
    duration: number;
    completed?: boolean;
    date?: string;
  }) => apiFetch<FocusSession>("/focus/sessions", { method: "POST", body: jsonBody(input) }),
  updateSession: (id: string, input: Partial<FocusSession>) =>
    apiFetch<FocusSession>(`/focus/sessions/${id}`, { method: "PATCH", body: jsonBody(input) }),
  completeSession: (id: string) =>
    apiFetch<FocusSession>(`/focus/sessions/${id}/complete`, { method: "POST" }),
};
