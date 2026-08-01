import { apiFetch, jsonBody } from "./client";

export type LunaMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "user" | "assistant";
  content: string;
  mood?: string | null;
  reacted: boolean;
  createdAt: string;
};

export type LunaContext = {
  profile: { level: number; xp: number; bond: number; streakDays: number; timezone: string } | null;
  latestCheckIn: {
    date: string;
    mood: string;
    energy: number;
    sleepHours?: number | null;
    tags: string[];
  } | null;
  todayHabits: { habitId: string; name: string; status: string; progress?: number | null }[];
};

export type LunaNote = { content: string; mood: string };

export const lunaApi = {
  context: () => apiFetch<LunaContext>("/luna/context"),
  note: (surface: string) => apiFetch<LunaNote>("/luna/note", { params: { surface } }),
  history: (limit = 200) => apiFetch<LunaMessage[]>("/luna/messages", { params: { limit } }),
  send: (message: string) =>
    apiFetch<{ userMessage: LunaMessage; assistantMessage: LunaMessage }>("/luna/messages", {
      method: "POST",
      body: jsonBody({ message }),
    }),
  react: (messageId: string, reacted: boolean) =>
    apiFetch<LunaMessage>(`/luna/messages/${messageId}/reaction`, {
      method: "PATCH",
      body: jsonBody({ reacted }),
    }),
  clear: () => apiFetch<void>("/luna/messages", { method: "DELETE" }),
};
