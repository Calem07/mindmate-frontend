import { apiFetch, jsonBody } from "./client";
import type { Mood } from "./checkIns";

export type JournalEntry = {
  id: string;
  date: string;
  mood?: Mood | null;
  title: string;
  excerpt: string;
  content?: string;
};

export const journalApi = {
  list: (params?: { from?: string; to?: string; q?: string; limit?: number }) =>
    apiFetch<JournalEntry[]>("/journal", { params }),
  prompts: () => apiFetch<string[]>("/journal/prompts"),
  create: (input: { date?: string; mood?: Mood | null; title?: string; content: string }) =>
    apiFetch<JournalEntry>("/journal", { method: "POST", body: jsonBody(input) }),
  get: (id: string) => apiFetch<JournalEntry>(`/journal/${id}`),
  update: (id: string, input: Partial<JournalEntry>) =>
    apiFetch<JournalEntry>(`/journal/${id}`, { method: "PATCH", body: jsonBody(input) }),
  delete: (id: string) => apiFetch<void>(`/journal/${id}`, { method: "DELETE" }),
};
