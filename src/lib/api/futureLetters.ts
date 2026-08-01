import { apiFetch, jsonBody } from "./client";

export type FutureLetter = {
  id: string;
  title: string;
  unlocksAt: string;
  unlockDate?: string;
  status: "sealed" | "unlocked";
  icon: string;
  body?: string | null;
  canOpen: boolean;
  daysRemaining: number;
  openedAt?: string | null;
};
type BackendLetter = Omit<FutureLetter, "status"> & {
  status: "SEALED" | "UNLOCKED" | "OPENED" | "sealed" | "unlocked";
};

const map = (l: BackendLetter): FutureLetter => {
  const status = String(l.status).toLowerCase() === "sealed" ? "sealed" : "unlocked";
  return {
    ...l,
    status,
    canOpen: l.canOpen ?? status === "unlocked",
    daysRemaining: Math.max(0, l.daysRemaining ?? 0),
  };
};

export const futureLettersApi = {
  list: async (limit = 100) =>
    (await apiFetch<BackendLetter[]>("/future-letters", { params: { limit } })).map(map),
  create: async (input: { title: string; body: string; unlocksAt: string; icon?: string }) =>
    map(
      await apiFetch<BackendLetter>("/future-letters", { method: "POST", body: jsonBody(input) }),
    ),
  get: async (id: string) => map(await apiFetch<BackendLetter>(`/future-letters/${id}`)),
  open: async (id: string) =>
    map(await apiFetch<BackendLetter>(`/future-letters/${id}/open`, { method: "POST" })),
  delete: (id: string) => apiFetch<void>(`/future-letters/${id}`, { method: "DELETE" }),
};
