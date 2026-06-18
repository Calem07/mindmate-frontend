// Centralized mock data for MindMate.
// Replace with real API/backend data later. Keep shapes stable.

export type Mood = "great" | "good" | "okay" | "low" | "rough";
export type HabitStatus = "done" | "in_progress" | "not_started";

export const user = {
  name: "Calem",
  email: "calem@mindmate.app",
  level: 4,
  bondPct: 82,
  xp: 1250,
  xpToNext: 2000,
  streakDays: 7,
  joinedAt: "2025-04-12",
};

export const lastCheckIn = {
  date: "2026-06-15",
  mood: "low" as Mood,
  energy: 3, // 1-5
  sleepHours: 6,
  note: "Couldn't quiet my mind before bed. Exam tomorrow.",
  tags: ["anxious", "tired", "exam-stress"],
};

export const luna = {
  name: "Luna",
  level: 4,
  mood: "purring softly",
  memories: 12,
  whispers: [
    "I noticed how kind you were to yourself yesterday. That matters.",
    "Take a slow breath with me. We have time.",
    "Your garden grew a little overnight 🌱",
    "You're doing better than you think, my friend.",
  ],
};

export const todayFocus = [
  { id: "checkin", icon: "MessageCircle", title: "Check in with Luna", subtitle: "A soft moment to feel", color: "purple" as const, xp: 20, done: true },
  { id: "water", icon: "Droplet", title: "Hydrate your garden", subtitle: "5 of 8 glasses", color: "cyan" as const, xp: 15, progress: 62 },
  { id: "calm", icon: "Brain", title: "Calm your mind", subtitle: "10 min of stillness", color: "teal" as const, xp: 25, done: true },
  { id: "study", icon: "BookOpen", title: "Study with focus", subtitle: "One quiet block", color: "purple" as const, xp: 30, progress: 0 },
];

export const moods: { id: Mood; emoji: string; label: string; color: string }[] = [
  { id: "great", emoji: "🌟", label: "Great", color: "text-secondary" },
  { id: "good", emoji: "🌿", label: "Good", color: "text-primary" },
  { id: "okay", emoji: "🌤️", label: "Okay", color: "text-purple" },
  { id: "low", emoji: "🌧️", label: "Low", color: "text-muted-foreground" },
  { id: "rough", emoji: "⛈️", label: "Rough", color: "text-destructive" },
];

export const habits = [
  { id: "h1", name: "Drink 2L of water", icon: "Droplet", status: "done" as HabitStatus, streak: 12, xp: 10 },
  { id: "h2", name: "Meditate 10 min", icon: "Brain", status: "done" as HabitStatus, streak: 5, xp: 15 },
  { id: "h3", name: "Study 30 min", icon: "BookOpen", status: "in_progress" as HabitStatus, streak: 3, xp: 20 },
  { id: "h4", name: "Sleep 8 hours", icon: "Moon", status: "done" as HabitStatus, streak: 9, xp: 15 },
  { id: "h5", name: "Workout 30 min", icon: "Dumbbell", status: "not_started" as HabitStatus, streak: 0, xp: 25 },
];

export const journalEntries = [
  { id: "j1", date: "2026-06-14", mood: "good" as Mood, title: "A gentler day", excerpt: "I let myself rest after lunch and the world didn't end. Luna would be proud." },
  { id: "j2", date: "2026-06-13", mood: "okay" as Mood, title: "Exam jitters", excerpt: "Heart racing again. Breathing helped a little. One step at a time." },
  { id: "j3", date: "2026-06-12", mood: "great" as Mood, title: "Small wins", excerpt: "Finished the chapter. Watered my plants. Smiled at a stranger." },
];

export const gratitudeEntries = [
  { id: "g1", date: "2026-06-14", items: ["Mom's call", "Warm tea", "Quiet morning"] },
  { id: "g2", date: "2026-06-13", items: ["Sunlight on my desk", "A funny meme", "Luna purring"] },
];

export const journalPrompts = [
  "What's one thing you're proud of yourself for today?",
  "Where did you feel safe today?",
  "What's a small kindness you noticed?",
  "What do you need to hear right now?",
  "Describe today in three colors.",
];

export const goals = [
  { id: "go1", name: "Ace my exams", due: "Due in 45 days", pct: 70, category: "Study" },
  { id: "go2", name: "Build a morning routine", due: "Due in 20 days", pct: 40, category: "Wellness" },
  { id: "go3", name: "Read 12 books this year", due: "Due in 180 days", pct: 25, category: "Growth" },
];

export const reflections = [
  { id: "r1", icon: "Brain", color: "primary", text: "You've been more consistent with check-ins this week.", date: "Today" },
  { id: "r2", icon: "Sparkles", color: "purple", text: "Your stress levels are decreasing. Proud of you!", date: "Yesterday" },
  { id: "r3", icon: "Clock", color: "secondary", text: "You sleep better on days you meditate.", date: "2 days ago" },
  { id: "r4", icon: "Heart", color: "purple", text: "Gratitude entries correlate with brighter mornings.", date: "This week" },
];

export const futureMeLetters = [
  { id: "fm1", title: "To my future self in 30 days", unlocksAt: "Jul 13, 2026", status: "sealed" as const, icon: "BookOpen" },
  { id: "fm2", title: "Letter from before exams", unlocksAt: "Aug 1, 2026", status: "sealed" as const, icon: "Target" },
  { id: "fm3", title: "A note from my calm self", unlocksAt: "Jun 1, 2026", status: "unlocked" as const, icon: "Heart" },
];

export const badges = [
  { id: "b1", name: "First Bloom", icon: "🌸", earned: true, desc: "Completed your first check-in" },
  { id: "b2", name: "Steady Hand", icon: "🌿", earned: true, desc: "7-day habit streak" },
  { id: "b3", name: "Quiet Mind", icon: "🧘", earned: true, desc: "10 meditation sessions" },
  { id: "b4", name: "Open Heart", icon: "💜", earned: true, desc: "5 journal entries" },
  { id: "b5", name: "Sun Seeker", icon: "🌅", earned: false, desc: "Check in 5 mornings in a row" },
  { id: "b6", name: "Forest Friend", icon: "🌳", earned: false, desc: "Reach Garden Level 6" },
  { id: "b7", name: "Star Gazer", icon: "🌟", earned: false, desc: "30-day streak" },
  { id: "b8", name: "Time Traveler", icon: "⏳", earned: false, desc: "Open a Future Me letter" },
];

export const challenges = [
  { id: "c1", name: "7 mornings with Luna", progress: 4, total: 7, reward: "+100 XP & Sun Seeker badge" },
  { id: "c2", name: "Hydration hero", progress: 5, total: 8, reward: "+50 XP" },
  { id: "c3", name: "Quiet week", progress: 2, total: 5, reward: "+75 XP & Garden seed" },
];

export const examSessions = [
  { id: "es1", subject: "Calculus", duration: 50, completed: true, date: "Today" },
  { id: "es2", subject: "Physics", duration: 30, completed: true, date: "Today" },
  { id: "es3", subject: "Literature", duration: 25, completed: false, date: "Now" },
];

export const examPresets = [
  { id: "p1", label: "Pomodoro", focus: 25, brk: 5 },
  { id: "p2", label: "Deep work", focus: 50, brk: 10 },
  { id: "p3", label: "Sprint", focus: 15, brk: 3 },
];

export const insights = {
  moodTrend: [3, 4, 3, 5, 4, 4, 5], // 1-5 over 7 days
  habitsCompleted: [2, 3, 4, 4, 5, 4, 5],
  focusMinutes: [20, 45, 30, 60, 50, 40, 75],
  sleepHours: [6.5, 7, 7.5, 8, 7, 8, 8.5],
  weekLabels: ["M", "T", "W", "T", "F", "S", "S"],
};

export const notifications = [
  { id: "n1", title: "Luna missed you", body: "It's been a quiet evening. Want to check in?", time: "2h", read: false },
  { id: "n2", title: "Your garden grew 🌱", body: "First Leaf is almost ready to bloom.", time: "1d", read: false },
  { id: "n3", title: "Streak saved!", body: "You kept your 7-day streak alive.", time: "2d", read: true },
];

export const settings = {
  notifications: { daily: true, streaks: true, lunaWhispers: true, weeklyRecap: false },
  privacy: { biometric: true, analytics: false, shareProgress: false },
  appearance: { theme: "dark" as "dark" | "light", reduceMotion: false },
};

// =======================
// Growth Garden config
// =======================
// Stage thresholds map directly to evaluation metrics (XP). Edit here to
// re-balance the journey; UI derives stage + progress automatically.
export type GardenStageKey = "seed" | "sprout" | "tree" | "bloom" | "ancient";

export type GardenStage = {
  key: GardenStageKey;
  emoji: string;
  title: string;
  /** XP at which this stage begins. Must be ascending. */
  xp: number;
  reward: string;
  lunaWhisper: string;
};

export const gardenStages: GardenStage[] = [
  { key: "seed",    emoji: "🌱", title: "Seed",         xp: 0,    reward: "First spark of light",   lunaWhisper: "A tiny seed is enough. We start here, together." },
  { key: "sprout",  emoji: "🌿", title: "Young Sprout", xp: 1000, reward: "Luna's lullaby unlocked", lunaWhisper: "Look — your first leaves. I'm so proud of you." },
  { key: "tree",    emoji: "🌳", title: "Young Tree",   xp: 2000, reward: "First Leaf badge",       lunaWhisper: "You're standing tall now. Your roots run deeper." },
  { key: "bloom",   emoji: "🌸", title: "Blooming",     xp: 3500, reward: "Petal soundscape",       lunaWhisper: "Every petal is a small kindness you gave yourself." },
  { key: "ancient", emoji: "🌟", title: "Ancient",      xp: 6000, reward: "Mythic Luna form",       lunaWhisper: "Mythic, quiet, enduring. You became your own safe place." },
];

// Stage-specific care actions. XP scales with the current form so early
// stages reward consistency, later stages reward depth.
export type CareAction = {
  id: string;
  icon: "ClipboardCheck" | "Droplet" | "BookOpen" | "Heart" | "Target";
  label: string;
  to: "/check-in" | "/habits" | "/journal" | "/exam-focus";
  /** Per-stage XP reward. */
  xpByStage: Record<GardenStageKey, number>;
  /** Per-stage micro-effect description. */
  effectByStage: Record<GardenStageKey, string>;
};

export const careActions: CareAction[] = [
  {
    id: "checkin", icon: "ClipboardCheck", label: "Check-In", to: "/check-in",
    xpByStage: { seed: 30, sprout: 25, tree: 25, bloom: 20, ancient: 18 },
    effectByStage: {
      seed: "Wakes the seed", sprout: "Unfurls a new leaf", tree: "Strengthens the trunk",
      bloom: "Opens a fresh blossom", ancient: "Releases golden pollen",
    },
  },
  {
    id: "water", icon: "Droplet", label: "Habits", to: "/habits",
    xpByStage: { seed: 20, sprout: 18, tree: 15, bloom: 14, ancient: 12 },
    effectByStage: {
      seed: "Soaks the soil", sprout: "Feeds tender roots", tree: "Deepens the roots",
      bloom: "Brightens the petals", ancient: "Glows along the bark",
    },
  },
  {
    id: "journal", icon: "BookOpen", label: "Journal", to: "/journal",
    xpByStage: { seed: 25, sprout: 22, tree: 20, bloom: 22, ancient: 24 },
    effectByStage: {
      seed: "Whispers to the seed", sprout: "Sways the sprout", tree: "Carves a ring in the trunk",
      bloom: "Scatters petals", ancient: "Etches a rune in the bark",
    },
  },
  {
    id: "gratitude", icon: "Heart", label: "Gratitude", to: "/journal",
    xpByStage: { seed: 15, sprout: 14, tree: 12, bloom: 16, ancient: 18 },
    effectByStage: {
      seed: "Warms the shell", sprout: "Tints leaves gold", tree: "Releases a soft hum",
      bloom: "Doubles the blossoms", ancient: "Summons fireflies",
    },
  },
  {
    id: "focus", icon: "Target", label: "Focus", to: "/exam-focus",
    xpByStage: { seed: 35, sprout: 32, tree: 30, bloom: 28, ancient: 26 },
    effectByStage: {
      seed: "Sharpens the sprout", sprout: "Grows a sturdy stem", tree: "Adds a new branch",
      bloom: "Sweetens the nectar", ancient: "Lights an ancient glyph",
    },
  },
];

// Growth Timeline — when the tree advanced stages, with a Luna message.
export type GrowthMilestone = {
  id: string;
  stage: GardenStageKey;
  date: string;
  daysAgo: string;
  lunaMessage: string;
};

export const growthTimeline: GrowthMilestone[] = [
  { id: "m1", stage: "seed",   date: "Apr 12, 2025", daysAgo: "Day 1",   lunaMessage: "We planted you today. I'll stay close." },
  { id: "m2", stage: "sprout", date: "May 03, 2025", daysAgo: "21 days in", lunaMessage: "Your first leaves found the light. I noticed." },
  { id: "m3", stage: "tree",   date: "Jul 18, 2025", daysAgo: "97 days in", lunaMessage: "A small trunk. A steady you. We made it here." },
  // Bloom & Ancient still ahead.
];

