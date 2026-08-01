self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  event.waitUntil(self.registration.showNotification(data.title || "A note from Luna", { body: data.body || "I’m here whenever you are.", icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", data: { route: data.route || "/" } }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const route = event.notification.data?.route || "/";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => { const existing = windows.find((client) => "focus" in client); if (existing) { existing.navigate(new URL(route, self.location.origin).href); return existing.focus(); } return clients.openWindow(new URL(route, self.location.origin).href); }));
});
