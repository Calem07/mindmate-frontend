import { apiFetch } from "./client";

export type UsageOverview = {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  activeUsersInPeriod: number;
  totalInteractions: number;
};

export type DailyUsage = {
  date: string;
  activeUsers: number;
  newUsers: number;
  checkIns: number;
  habitCompletions: number;
  lunaMessages: number;
  journalEntries: number;
  gratitudeEntries: number;
  goalsCreated: number;
  focusSessions: number;
};

export type FeatureUsage = { feature: string; count: number };

export type UsageAnalytics = {
  from: string;
  to: string;
  overview: UsageOverview;
  daily: DailyUsage[];
  features: FeatureUsage[];
};

export const adminAnalyticsApi = {
  usage: (params?: { from?: string; to?: string }) =>
    apiFetch<UsageAnalytics>("/admin/analytics/usage", { params }),
};
