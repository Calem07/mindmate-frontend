import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LunaAvatar } from "./LunaAvatar";
import { useAuth } from "./AuthProvider";
import { getOnboarding, type OnboardingStage } from "@/lib/onboarding";

const steps: Record<
  Exclude<OnboardingStage, "complete">,
  { title: string; body: string; route: string; action: string }
> = {
  "check-in": {
    title: "A first little check-in",
    body: "Tell me how today feels. We can start softly.",
    route: "/check-in",
    action: "Check in",
  },
  habits: {
    title: "Let’s plant a few habits",
    body: "Choose one small ritual that could support your days.",
    route: "/habits",
    action: "Set up habits",
  },
  goals: {
    title: "What are you growing toward?",
    body: "One gentle goal gives your next steps somewhere to go.",
    route: "/goals",
    action: "Set up a goal",
  },
  "future-me": {
    title: "A note for future you",
    body: "You can leave yourself something kind to find later, or skip this for now.",
    route: "/future-me",
    action: "Write a letter",
  },
  journal: {
    title: "One line for today",
    body: "A small reflection is enough. You can skip this whenever you need.",
    route: "/journal",
    action: "Open journal",
  },
};

function LunaPrompt({
  item,
  onOpen,
}: {
  item: (typeof steps)[keyof typeof steps];
  onOpen: () => void;
}) {
  return (
    <div className="flex items-start gap-3 text-left">
      <LunaAvatar size="sm" mood="warm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{item.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
        <button type="button" onClick={onOpen} className="mt-2 text-xs font-semibold text-purple">
          {item.action} →
        </button>
      </div>
    </div>
  );
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<OnboardingStage | null>(null);

  useEffect(() => {
    const sync = () => setStage(getOnboarding(user?.id)?.stage ?? null);
    sync();
    window.addEventListener("mindmate-onboarding-changed", sync);
    return () => window.removeEventListener("mindmate-onboarding-changed", sync);
  }, [user?.id]);

  useEffect(() => {
    if (!session || !stage || stage === "complete") return;
    const item = steps[stage];
    const id = toast.custom(
      (toastId) => (
        <div className="glass-strong w-[min(92vw,22rem)] rounded-3xl border border-white/10 p-4 shadow-2xl">
          <LunaPrompt
            item={item}
            onOpen={() => {
              void navigate({ to: item.route as never });
              toast.dismiss(toastId);
            }}
          />
        </div>
      ),
      { duration: 30000 },
    );
    return () => {
      toast.dismiss(id);
    };
  }, [navigate, session, stage]);

  return <>{children}</>;
}
