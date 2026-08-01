import { apiFetch, jsonBody } from "./client";

export type Mood = "great" | "good" | "okay" | "low" | "rough";

export const moods: { id: Mood; emoji: string; label: string; color: string }[] = [
  { id: "great", emoji: "🌟", label: "Great", color: "text-secondary" },
  { id: "good", emoji: "🌿", label: "Good", color: "text-primary" },
  { id: "okay", emoji: "🌤️", label: "Okay", color: "text-purple" },
  { id: "low", emoji: "🌧️", label: "Low", color: "text-muted-foreground" },
  { id: "rough", emoji: "⛈️", label: "Rough", color: "text-destructive" },
];

export type CheckIn = {
  id: string;
  date: string;
  mood: Mood;
  energy: number;
  sleepHours?: number | null;
  note?: string | null;
  tags: string[];
};

export const checkInsApi = {
  list: (params?: { from?: string; to?: string }) => apiFetch<CheckIn[]>("/check-ins", { params }),
  today: () => apiFetch<CheckIn | null>("/check-ins/today"),
  save: (input: {
    date?: string;
    mood: Mood;
    energy: number;
    sleepHours?: number;
    note?: string;
    tags?: string[];
  }) => apiFetch<CheckIn>("/check-ins", { method: "POST", body: jsonBody(input) }),
};
