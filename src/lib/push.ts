import { notificationsApi } from "./api/notifications";

const publicKey = import.meta.env.VITE_PUSH_PUBLIC_KEY?.trim();

function decodeBase64Url(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export async function enablePushNotifications() {
  if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  if (await Notification.requestPermission() !== "granted") return false;
  const registration = await navigator.serviceWorker.register("/sw.js");
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeBase64Url(publicKey) });
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return false;
  await notificationsApi.subscribePush({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth });
  return true;
}

export async function registerExistingPushPermission() {
  if (!publicKey || !("serviceWorker" in navigator) || !("Notification" in window) || Notification.permission !== "granted") return;
  await enablePushNotifications().catch(() => undefined);
}
