import { apiFetch } from "./client";

export type InsightBars = {
  moodTrend: number[];
  habitsCompleted: number[];
  focusMinutes: number[];
  sleepHours: number[];
  weekLabels: string[];
};

export type Reflection = { id: string; icon: string; color: string; text: string; date: string };

const emptyBars: InsightBars = {
  moodTrend: [],
  habitsCompleted: [],
  focusMinutes: [],
  sleepHours: [],
  weekLabels: ["M", "T", "W", "T", "F", "S", "S"],
};

export const insightsApi = {
  async bars(): Promise<InsightBars> {
    const [mood, habits, focus, weekly] = await Promise.all([
      apiFetch<{ values?: number[]; moodTrend?: number[] }>("/insights/mood-trend"),
      apiFetch<{ values?: number[]; habitsCompleted?: number[] }>("/insights/habits"),
      apiFetch<{ values?: number[]; focusMinutes?: number[] }>("/insights/focus"),
      apiFetch<Partial<InsightBars>>("/insights/weekly"),
    ]);
    return {
      ...emptyBars,
      ...weekly,
      moodTrend: mood.moodTrend ?? mood.values ?? weekly.moodTrend ?? [],
      habitsCompleted: habits.habitsCompleted ?? habits.values ?? weekly.habitsCompleted ?? [],
      focusMinutes: focus.focusMinutes ?? focus.values ?? weekly.focusMinutes ?? [],
      sleepHours: weekly.sleepHours ?? [],
    };
  },
  reflections: () => apiFetch<Reflection[]>("/reflections"),
};
