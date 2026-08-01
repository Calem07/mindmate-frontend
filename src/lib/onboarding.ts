export type OnboardingStage = "check-in" | "habits" | "goals" | "future-me" | "journal" | "complete";

type OnboardingState = { stage: OnboardingStage };

function key(userId: string) {
  return `mindmate-onboarding:${userId}`;
}

export function getOnboarding(userId: string | undefined): OnboardingState | null {
  if (!userId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as OnboardingState) : null;
  } catch {
    return null;
  }
}

export function startOnboarding(userId: string) {
  setOnboarding(userId, "check-in");
}

export function setOnboarding(userId: string, stage: OnboardingStage) {
  window.localStorage.setItem(key(userId), JSON.stringify({ stage }));
  window.dispatchEvent(new Event("mindmate-onboarding-changed"));
}

export function advanceOnboarding(userId: string | undefined, from: OnboardingStage, to: OnboardingStage) {
  if (userId && getOnboarding(userId)?.stage === from) {
    setOnboarding(userId, to);
    return true;
  }
  return false;
}
