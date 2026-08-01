import { apiFetch, jsonBody } from "./client";

export type Goal = {
  id: string;
  name: string;
  due: string;
  pct: number;
  category: string;
  status?: "ACTIVE" | "COMPLETED" | "ARCHIVED";
};

export const goalsApi = {
  list: (status: "ACTIVE" | "COMPLETED" = "ACTIVE", limit = 100) =>
    apiFetch<Goal[]>("/goals", { params: { status, limit } }),
  create: (input: { name: string; category?: string; dueDate?: string; pct?: number }) =>
    apiFetch<Goal>("/goals", { method: "POST", body: jsonBody(input) }),
  update: (id: string, input: Partial<Goal> & { dueDate?: string }) =>
    apiFetch<Goal>(`/goals/${id}`, { method: "PATCH", body: jsonBody(input) }),
  complete: (id: string) => apiFetch<Goal>(`/goals/${id}/complete`, { method: "POST" }),
  delete: (id: string) => apiFetch<void>(`/goals/${id}`, { method: "DELETE" }),
};
