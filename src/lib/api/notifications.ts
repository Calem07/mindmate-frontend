import { apiFetch, jsonBody } from "./client";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  route?: string | null;
  entityId?: string | null;
  createdAt: string;
  read: boolean;
  dismissed: boolean;
};

export type PushSubscriptionPayload = { endpoint: string; p256dh: string; auth: string };
const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean; includeDismissed?: boolean; limit?: number }) =>
    apiFetch<AppNotification[]>("/notifications", {
      params,
      headers: { "X-Timezone": timezone() },
    }),
  read: (id: string) => apiFetch<AppNotification>(`/notifications/${id}/read`, { method: "POST" }),
  dismiss: (id: string) =>
    apiFetch<AppNotification>(`/notifications/${id}/dismiss`, { method: "POST" }),
  readAll: () => apiFetch<void>("/notifications/read-all", { method: "POST" }),
  subscribePush: (payload: PushSubscriptionPayload) =>
    apiFetch<void>("/notifications/push-subscription", { method: "POST", body: jsonBody(payload) }),
};
