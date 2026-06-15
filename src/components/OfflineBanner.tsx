import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+0.5rem)] z-[80] -translate-x-1/2 animate-in fade-in slide-in-from-top-2"
    >
      <div className="glass-strong flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-foreground/90 shadow-lg">
        <WifiOff className="h-3.5 w-3.5 text-purple" />
        You're offline — Luna will sync when you're back.
      </div>
    </div>
  );
}
