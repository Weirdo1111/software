import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GlobalBuddyCompanion } from "@/components/global-buddy-companion";

const pushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/reading",
  useRouter: () => ({
    push: pushSpy,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "lang" ? "en" : null),
  }),
}));

vi.mock("@/components/home/buddy-companion", () => ({
  BuddyCompanion: ({ className }: { className?: string }) => <div className={className}>Buddy Avatar</div>,
}));

vi.mock("@/lib/buddy-xp", () => ({
  createEmptyBuddyXpSummary: () => ({
    totalXp: 220,
    totalCompletedSources: 3,
    counts: {
      listeningCompletions: 1,
      speakingCompletions: 0,
      readingCompletions: 1,
      writingCompletions: 0,
      reviewSessions: 1,
      wordGameClears: 0,
      escapeRoomClears: 0,
      dormLockoutClears: 0,
      lastTrainClears: 0,
    },
  }),
  fetchBuddyXpSummary: vi.fn().mockResolvedValue({
    totalXp: 220,
    totalCompletedSources: 3,
    counts: {
      listeningCompletions: 1,
      speakingCompletions: 0,
      readingCompletions: 1,
      writingCompletions: 0,
      reviewSessions: 1,
      wordGameClears: 0,
      escapeRoomClears: 0,
      dormLockoutClears: 0,
      lastTrainClears: 0,
    },
  }),
  getBuddyXpSummaryFromStorage: () => ({
    totalXp: 220,
    totalCompletedSources: 3,
    counts: {
      listeningCompletions: 1,
      speakingCompletions: 0,
      readingCompletions: 1,
      writingCompletions: 0,
      reviewSessions: 1,
      wordGameClears: 0,
      escapeRoomClears: 0,
      dormLockoutClears: 0,
      lastTrainClears: 0,
    },
  }),
  subscribeBuddyXpSources: () => () => {},
}));

vi.mock("@/lib/buddy-xp-events", () => ({
  subscribeBuddyXpEvents: () => () => {},
}));

vi.mock("@/lib/buddy-wardrobe", () => ({
  DEFAULT_BUDDY_OUTFIT: {
    hat: "none",
    accessory: "none",
    top: "none",
    bottom: "none",
  },
  loadBuddyOutfitFromStorage: () => ({
    hat: "none",
    accessory: "none",
    top: "none",
    bottom: "none",
  }),
  subscribeBuddyOutfit: () => () => {},
}));

vi.mock("@/lib/learning-tracker", () => ({
  createEmptyLearningTrackerSnapshot: () => ({
    startedAt: new Date().toISOString(),
    skills: {
      listening: { attempts: 0, correct: 0, minutes: 0, completed: 0, lastUpdatedAt: null },
      speaking: { attempts: 0, correct: 0, minutes: 0, completed: 0, lastUpdatedAt: null },
      reading: { attempts: 0, correct: 0, minutes: 0, completed: 0, lastUpdatedAt: null },
      writing: { attempts: 0, correct: 0, minutes: 0, completed: 0, lastUpdatedAt: null },
    },
  }),
  loadLearningTrackerSnapshotFromStorage: () => ({
    startedAt: new Date().toISOString(),
    skills: {
      listening: { attempts: 0, correct: 0, minutes: 0, completed: 0, lastUpdatedAt: null },
      speaking: { attempts: 0, correct: 0, minutes: 0, completed: 0, lastUpdatedAt: null },
      reading: { attempts: 0, correct: 0, minutes: 0, completed: 1, lastUpdatedAt: null },
      writing: { attempts: 0, correct: 0, minutes: 0, completed: 0, lastUpdatedAt: null },
    },
  }),
  subscribeLearningTracker: () => () => {},
}));

vi.mock("@/lib/buddy-sound", () => ({
  isBuddySoundEnabled: () => true,
  playBuddySound: vi.fn().mockResolvedValue(undefined),
  setBuddySoundEnabled: vi.fn(),
  unlockBuddySound: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/schedule", () => ({
  loadSchedulePreferencesFromStorage: () => ({
    goal: "coursework",
  }),
  subscribeSchedulePreferences: () => () => {},
}));

describe("GlobalBuddyCompanion", () => {
  afterEach(() => {
    pushSpy.mockReset();
    window.localStorage.clear();
  });

  it("opens the buddy guide panel without breaking the pet shell", async () => {
    const user = userEvent.setup();

    render(<GlobalBuddyCompanion />);

    await user.click(screen.getByRole("button", { name: /click buddy to open the guide/i }));

    expect(screen.getByRole("heading", { name: /ask how the site works/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^reading$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^review$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /turn buddy sound off/i })).toBeInTheDocument();
  });
});
