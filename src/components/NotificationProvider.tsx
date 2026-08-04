import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";
import { LunaAvatar } from "./LunaAvatar";
import { notificationsApi, type AppNotification } from "@/lib/api/notifications";
import { registerExistingPushPermission } from "@/lib/push";

function LunaNotification({
  item,
  onOpen,
  onDismiss,
}: {
  item: AppNotification;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const startX = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const [offset, setOffset] = useState(0);
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (startX.current !== null) setOffset(event.clientX - startX.current);
  };
  const handlePointerUp = () => {
    if (Math.abs(offset) > 96) {
      suppressClick.current = true;
      onDismiss();
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    } else setOffset(0);
    startX.current = null;
  };
  return (
    <button
      onClick={() => {
        if (!suppressClick.current) onOpen();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="flex w-full touch-pan-y items-start gap-3 text-left transition-transform duration-200"
      style={{ transform: `translateX(${offset}px)` }}
      aria-label={`${item.title}. Swipe to dismiss or tap to open.`}
    >
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
                  onDismiss={() => {
                    void notificationsApi
                      .dismiss(item.id)
                      .finally(() => setUnreadCount((count) => Math.max(0, count - 1)));
                    toast.dismiss(toastId);
                  }}
                />
              </div>
            ),
            { duration: 30000 },
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
