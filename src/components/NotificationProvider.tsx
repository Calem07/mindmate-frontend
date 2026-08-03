import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";
import { LunaAvatar } from "./LunaAvatar";
import { notificationsApi, type AppNotification } from "@/lib/api/notifications";
import { registerExistingPushPermission } from "@/lib/push";

function LunaNotification({ item, onOpen }: { item: AppNotification; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex w-full items-start gap-3 text-left">
      <LunaAvatar size="sm" mood="warm" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{item.title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {item.body}
        </span>
      </span>
    </button>
  );
}

type NotificationContextValue = { unreadCount: number };
const NotificationContext = createContext<NotificationContextValue>({ unreadCount: 0 });

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const shown = useRef(new Set<string>());
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!session) {
      setUnreadCount(0);
      shown.current.clear();
      return;
    }
    let cancelled = false;
    const poll = async (force = false) => {
      const items = await notificationsApi.list({ unreadOnly: true, limit: 5 }).catch(() => []);
      if (cancelled) return;
      setUnreadCount(items.length);
      items
        .filter((item) => force || !shown.current.has(item.id))
        .slice(0, 3)
        .forEach((item) => {
          shown.current.add(item.id);
          toast.custom(
            (toastId) => (
              <div className="glass-strong w-[min(92vw,22rem)] rounded-3xl border border-white/10 p-4 shadow-2xl">
                <LunaNotification
                  item={item}
                  onOpen={() => {
                    void notificationsApi
                      .read(item.id)
                      .finally(() => setUnreadCount((count) => Math.max(0, count - 1)));
                    toast.dismiss(toastId);
                  }}
                />
              </div>
            ),
            { duration: 90000 },
          );
        });
    };
    void poll();
    void registerExistingPushPermission();
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    const onNotificationRequest = () => void poll(true);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("mindmate-notifications-open", onNotificationRequest);
    const timer = window.setInterval(() => void poll(), 15 * 60 * 1000);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("mindmate-notifications-open", onNotificationRequest);
      window.clearInterval(timer);
    };
  }, [session]);
  return (
    <NotificationContext.Provider value={{ unreadCount }}>{children}</NotificationContext.Provider>
  );
}
