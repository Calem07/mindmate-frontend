import { apiFetch, jsonBody } from "./client";

export type GratitudeEntry = { id: string; date: string; items: string[] };

export const gratitudeApi = {
  list: (params?: { from?: string; to?: string; limit?: number }) =>
    apiFetch<GratitudeEntry[]>("/gratitude", { params }),
  create: (input: { date?: string; items: string[] }) =>
    apiFetch<GratitudeEntry>("/gratitude", { method: "POST", body: jsonBody(input) }),
  update: (id: string, input: Partial<GratitudeEntry>) =>
    apiFetch<GratitudeEntry>(`/gratitude/${id}`, { method: "PATCH", body: jsonBody(input) }),
  delete: (id: string) => apiFetch<void>(`/gratitude/${id}`, { method: "DELETE" }),
};
