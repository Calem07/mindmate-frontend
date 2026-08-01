import { apiFetch } from "./client";

export type Challenge = {
  id: string;
  name: string;
  progress: number;
  total: number;
  reward: string;
  claimed?: boolean;
};
type BackendChallenge = Challenge & { code?: string };

const map = (c: BackendChallenge): Challenge => ({ ...c, id: c.id ?? c.code ?? "" });

export const challengesApi = {
  list: async () => (await apiFetch<BackendChallenge[]>("/challenges")).map(map),
  claim: async (id: string) =>
    map(await apiFetch<BackendChallenge>(`/challenges/${id}/claim`, { method: "POST" })),
};
