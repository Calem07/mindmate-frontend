import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Check, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LunaAvatar, useAmbientLunaMood } from "@/components/LunaAvatar";
import { EmptyState } from "@/components/StateViews";
import { ScreenHeader, Shell } from "@/components/Shell";
import { notificationsApi, type AppNotification } from "@/lib/api/notifications";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications â€” MindMate" }] }),
  component: Notifications,
});

function Notifications() {
  const ambientMood = useAmbientLunaMood();
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    notificationsApi
      .list({ includeDismissed: true, limit: 100 })
      .then(setItems)
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Could not load notifications"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const markAllRead = async () => {
    await notificationsApi.readAll();
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  };

  const openItem = async (item: AppNotification) => {
    if (!item.read) {
      await notificationsApi.read(item.id).catch(() => undefined);
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? { ...candidate, read: true } : candidate,
        ),
      );
    }
    if (item.route) void navigate({ to: item.route as never });
  };

  return (
    <Shell>
      <ScreenHeader
        title="Luna's notes"
        back
        right={
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="glass flex h-9 w-9 items-center justify-center rounded-full"
            aria-label="Mark all notifications as read"
            title="Mark all as read"
          >
            <Check className="h-4 w-4" />
          </button>
        }
      />

      <section className="px-5 pt-5">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple/25 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <LunaAvatar mood={ambientMood} size="lg" bounce />
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-purple">
                <Sparkles className="h-4 w-4" /> A note from Luna
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Little reminders, celebrations, and gentle next steps are kept here for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-6">
        {loading ? (
          <div className="glass h-24 animate-pulse rounded-3xl" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notes yet"
            body="Luna will leave something here when there is a little moment worth keeping."
          />
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void openItem(item)}
                className={`glass flex w-full items-start gap-3 rounded-2xl p-4 text-left transition active:scale-[0.99] ${item.read ? "opacity-70" : "border-purple/30"}`}
              >
                <LunaAvatar size="sm" mood="warm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold">{item.title}</span>
                    {!item.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple animate-pulse-glow" />
                    )}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {item.body}
                  </span>
                  <span className="mt-2 block text-[10px] text-muted-foreground">
                    {formatNotificationDate(item.createdAt)}
                    {item.dismissed ? " Â· dismissed on the way" : ""}
                  </span>
                </span>
                {item.route && (
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}
