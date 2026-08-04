import { toast } from "sonner";
import { LunaAvatar } from "@/components/LunaAvatar";

export function lunaToast(message: string) {
  return toast.custom(
    (toastId) => (
      <button
        type="button"
        onClick={() => toast.dismiss(toastId)}
        className="glass-strong flex w-[min(92vw,22rem)] items-center gap-3 rounded-3xl border border-purple/30 p-4 text-left shadow-2xl glow-purple"
        aria-label={`Luna: ${message}`}
      >
        <LunaAvatar size="sm" mood="warm" />
        <span className="min-w-0 flex-1 text-sm font-semibold">{message}</span>
      </button>
    ),
    { duration: 30000 },
  );
}
