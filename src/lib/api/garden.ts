import { apiFetch, jsonBody } from "./client";

export type GardenStageKey = "seed" | "sprout" | "tree" | "bloom" | "ancient";
export type GardenStage = {
  key: GardenStageKey;
  emoji: string;
  title: string;
  xp: number;
  reward: string;
  lunaWhisper: string;
};
export type CareAction = {
  id: string;
  icon: "ClipboardCheck" | "Droplet" | "BookOpen" | "Heart" | "Target";
  label: string;
  to: "/check-in" | "/habits" | "/journal" | "/exam-focus";
  xpByStage: Record<GardenStageKey, number>;
  effectByStage: Record<GardenStageKey, string>;
};
export type GrowthMilestone = {
  id: string;
  stage: GardenStageKey;
  date: string;
  daysAgo: string;
  lunaMessage: string;
};
export type Collectible = { id: string; emoji: string; name: string; owned: boolean };
export type Garden = {
  xp: number;
  level: number;
  currentStage: GardenStageKey;
  gardenStages: GardenStage[];
  careActions: CareAction[];
  growthTimeline: GrowthMilestone[];
  collectibles: Collectible[];
};

const effects: Record<GardenStageKey, string> = {
  seed: "Wakes the seed",
  sprout: "Unfurls a new leaf",
  tree: "Strengthens the trunk",
  bloom: "Opens a fresh blossom",
  ancient: "Releases golden pollen",
};

function mapGarden(garden: Garden): Garden {
  const normalizeKey = (key: string) => key.toLowerCase() as GardenStageKey;
  const normalizeXpByStage = (values: Record<string, number>) =>
    Object.entries(values ?? {}).reduce(
      (acc, [key, value]) => ({ ...acc, [normalizeKey(key)]: value }),
      {} as Record<GardenStageKey, number>,
    );
  return {
    ...garden,
    currentStage: normalizeKey(String(garden.currentStage)),
    gardenStages: (garden.gardenStages ?? []).map((stage) => ({
      ...stage,
      key: normalizeKey(String(stage.key)),
    })),
    careActions: garden.careActions.map((action) => ({
      ...action,
      xpByStage: normalizeXpByStage(action.xpByStage),
      effectByStage: Object.keys(action.xpByStage).reduce(
        (acc, key) => ({ ...acc, [normalizeKey(key)]: effects[normalizeKey(key)] }),
        {} as Record<GardenStageKey, string>,
      ),
    })),
    growthTimeline: garden.growthTimeline ?? [],
    collectibles: garden.collectibles ?? [],
  };
}

export const gardenApi = {
  get: async () => mapGarden(await apiFetch<Garden>("/garden")),
  care: async (actionId: string) =>
    mapGarden(
      await apiFetch<Garden>("/garden/care", { method: "POST", body: jsonBody({ actionId }) }),
    ),
  timeline: (limit = 100) => apiFetch<GrowthMilestone[]>("/garden/timeline", { params: { limit } }),
};
