import { apiFetch, jsonBody } from "./client";

export type HabitStatus = "done" | "in_progress" | "not_started";
type BackendHabitStatus =
  | "DONE"
  | "IN_PROGRESS"
  | "NOT_STARTED"
  | "SKIPPED"
  | "done"
  | "in_progress"
  | "not_started"
  | "skipped";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  status: HabitStatus;
  streak: number;
  xp: number;
};
type HabitResponse = { id: string; name: string; icon: string; xpReward: number };
type TodayHabitResponse = {
  habit: HabitResponse;
  log: { status: BackendHabitStatus; progress?: number | null };
};

const fromStatus = (status: BackendHabitStatus): HabitStatus => {
  const normalized = status.toUpperCase();
  return normalized === "DONE"
    ? "done"
    : normalized === "IN_PROGRESS"
      ? "in_progress"
      : "not_started";
};
const toStatus = (status: HabitStatus): BackendHabitStatus =>
  status === "done" ? "DONE" : status === "in_progress" ? "IN_PROGRESS" : "NOT_STARTED";

export const habitsApi = {
  async today() {
    const rows = await apiFetch<TodayHabitResponse[]>("/habits/today");
    return rows.map(({ habit, log }) => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      status: fromStatus(log.status),
      streak: 0,
      xp: habit.xpReward,
    }));
  },
  create: (input: { name: string; icon?: string; xpReward?: number }) =>
    apiFetch<HabitResponse>("/habits", { method: "POST", body: jsonBody(input) }),
  log: (habitId: string, input: { status: HabitStatus; progress?: number | null; date?: string }) =>
    apiFetch(`/habits/${habitId}/logs`, {
      method: "PUT",
      body: jsonBody({ ...input, status: toStatus(input.status) }),
    }),
};
