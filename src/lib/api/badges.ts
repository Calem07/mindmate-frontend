import { apiFetch } from "./client";

export type Badge = { id: string; name: string; icon: string; earned: boolean; desc: string };
type BackendBadge = {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  desc: string;
};

export const badgesApi = {
  async list(): Promise<Badge[]> {
    const rows = await apiFetch<BackendBadge[]>("/badges");
    return rows.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      earned: b.earned,
      desc: b.desc,
    }));
  },
};
