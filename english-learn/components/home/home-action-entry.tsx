"use client";

// AI-assisted authorship note: the 2026 Buddy Campus home refresh in this module
// was drafted with AI help and then reviewed, edited, and integrated by the team.

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  CalendarDays,
  CircleHelp,
  Compass,
  Flame,
  FileText,
  Gamepad2,
  Glasses,
  Hand,
  HatGlasses,
  Headphones,
  LibraryBig,
  Lock,
  Mic,
  PawPrint,
  PenLine,
  Sparkles,
  Shirt,
  Target,
  Trophy,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { BuddyCampusLobby } from "@/components/home/buddy-campus-lobby";
import { BuddyCompanion, type BuddyVariant } from "@/components/home/buddy-companion";
import { HomeLearningModules } from "@/components/home/home-learning-modules";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BUDDY_XP_RULES } from "@/lib/buddy-xp-config";
import { type Locale } from "@/lib/i18n/dictionaries";
import {
  createEmptyLearningTrackerSnapshot,
  loadLearningTrackerSnapshotFromStorage,
  subscribeLearningTracker,
} from "@/lib/learning-tracker";
import {
  DEFAULT_BUDDY_OUTFIT,
  loadBuddyOutfitFromStorage,
  saveBuddyOutfitToStorage,
  subscribeBuddyOutfit,
  type BuddyClothing,
  type BuddyGlasses,
  type BuddyHat,
  type BuddyHeldItem,
  type BuddyOutfit,
} from "@/lib/buddy-wardrobe";
import {
  createEmptyBuddyXpSummary,
  fetchBuddyXpSummary,
  getBuddyXpSummaryFromStorage,
  subscribeBuddyXpSources,
} from "@/lib/buddy-xp";
import {
  createDefaultSchedulePreferences,
  generateWeeklySchedule,
  getActiveWeekPlanOverrides,
  hydrateSchedulePreferencesFromServer,
  loadSchedulePreferencesFromStorage,
  saveSchedulePreferencesToStorage,
  subscribeSchedulePreferences,
  type ScheduleGoal,
  type ScheduleMode,
  type StudyWindow,
} from "@/lib/schedule";

function normalizeLevel(raw: string | null) {
  const next = String(raw ?? "A2").toUpperCase();
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(next)) return next;
  return "A2";
}

function toDisplayName(raw: string | null) {
  const cleaned = String(raw ?? "").trim();
  if (!cleaned) return "Learner";
  if (cleaned.includes("@")) return cleaned.split("@")[0] || "Learner";
  return cleaned;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getAccuracy(correct: number, attempts: number) {
  if (attempts <= 0) return 0;
  return Math.round((correct / attempts) * 100);
}

const LEVEL_XP_BASE = 100;
const LEVEL_XP_STEP = 40;

function getXpForLevel(level: number) {
  if (level <= 1) return 0;

  let total = 0;
  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += LEVEL_XP_BASE + (currentLevel - 1) * LEVEL_XP_STEP;
  }
  return total;
}

function getBuddyLevel(xp: number) {
  let level = 1;
  while (xp >= getXpForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

function getXpNeededForNextLevel(level: number) {
  return LEVEL_XP_BASE + (level - 1) * LEVEL_XP_STEP;
}

function getBuddyStage(xp: number, locale: Locale) {
  if (xp >= 780) {
    return {
      id: "scholar" as const,
      title: locale === "zh" ? "学者学伴" : "Scholar Buddy",
      note:
        locale === "zh"
          ? "你的学伴已经进入展示期，适合承担更完整的听说任务。"
          : "Your buddy is now in showcase mode and ready for longer listening and speaking quests.",
      nextXp: 980,
      mood: "proud" as const,
    };
  }

  if (xp >= 440) {
    return {
      id: "explorer" as const,
      title: locale === "zh" ? "校园探索者" : "Campus Explorer",
      note:
        locale === "zh"
          ? "正在主动探索讲座、场景口语和校园交流。"
          : "Actively exploring lectures, speaking scenes, and community tasks.",
      nextXp: 780,
      mood: "happy" as const,
    };
  }

  if (xp >= 180) {
    return {
      id: "growing" as const,
      title: locale === "zh" ? "成长学伴" : "Growing Buddy",
      note:
        locale === "zh"
          ? "已经养成基础学习节奏，继续完成任务就会明显进化。"
          : "A steady rhythm is forming. Keep completing quests to trigger the next evolution.",
      nextXp: 440,
      mood: "happy" as const,
    };
  }

  return {
    id: "fresh" as const,
    title: locale === "zh" ? "新生学伴" : "Fresh Buddy",
    note:
      locale === "zh"
        ? "这是你的新学伴，先完成第一批任务让它长大。"
        : "This is your new companion. Finish the first few quests to help it grow.",
    nextXp: 180,
    mood: "calm" as const,
  };
}

function getStageLabel(level: string, locale: Locale) {
  if (level === "A1" || level === "A2") return locale === "zh" ? "基础阶段" : "Foundation stage";
  if (level === "B1" || level === "B2") return locale === "zh" ? "进阶阶段" : "Developing stage";
  return locale === "zh" ? "提升阶段" : "Advanced stage";
}

function getGoalFocus(goal: ScheduleGoal) {
  if (goal === "research") return "research" as const;
  if (goal === "seminar") return "seminar" as const;
  return "coursework" as const;
}

function getGoalVariant(goal: ScheduleGoal): BuddyVariant {
  if (goal === "research") return "bunny";
  if (goal === "seminar") return "cat";
  return "bear";
}

function getGoalLabel(goal: ScheduleGoal, locale: Locale) {
  if (goal === "research") return locale === "zh" ? "研究模式" : "Research mode";
  if (goal === "seminar") return locale === "zh" ? "研讨模式" : "Seminar mode";
  return locale === "zh" ? "课程模式" : "Coursework mode";
}

function getQuestVisual(skill: string) {
  if (skill === "listening") {
    return {
      Icon: Headphones,
      accent: "from-[#66c4ff] to-[#7be3d2]",
      iconBg: "bg-[#e4f7ff] text-[#2065a5]",
    };
  }

  if (skill === "speaking") {
    return {
      Icon: Mic,
      accent: "from-[#ffb98a] to-[#ff8f9c]",
      iconBg: "bg-[#fff0e7] text-[#bf6638]",
    };
  }

  if (skill === "reading") {
    return {
      Icon: LibraryBig,
      accent: "from-[#9bd7b0] to-[#84c8ff]",
      iconBg: "bg-[#ebfff2] text-[#2a7a5e]",
    };
  }

  if (skill === "writing") {
    return {
      Icon: WandSparkles,
      accent: "from-[#ffd35d] to-[#ff9bb2]",
      iconBg: "bg-[#fff9df] text-[#95630a]",
    };
  }

  return {
    Icon: Sparkles,
    accent: "from-[#d8e9ff] to-[#ffe1bf]",
    iconBg: "bg-[#f2f8ff] text-[#587089]",
  };
}

const majorStickers = [
  "Civil Engineering",
  "Mathematics",
  "Computing Science",
  "Mechanical Engineering",
  "Transportation",
] as const;

const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LAST_SEEN_BUDDY_LEVEL_KEY = "english-learn:buddy:last-seen-level";
type WardrobeCategory = "hat" | "clothing" | "glasses" | "heldItem";

const BUDDY_WARDROBE_UNLOCK_ORDER: Array<
  | { category: "hat"; value: BuddyHat }
  | { category: "clothing"; value: BuddyClothing }
  | { category: "glasses"; value: BuddyGlasses }
  | { category: "heldItem"; value: BuddyHeldItem }
> = [
  { category: "hat", value: "sunhat" },
  { category: "clothing", value: "shorts" },
  { category: "glasses", value: "star" },
  { category: "heldItem", value: "flower" },
  { category: "hat", value: "strawhat" },
  { category: "clothing", value: "jeans" },
  { category: "glasses", value: "heart" },
  { category: "heldItem", value: "tea" },
  { category: "hat", value: "cap" },
  { category: "clothing", value: "bloomers" },
  { category: "glasses", value: "square" },
  { category: "heldItem", value: "starwand" },
  { category: "hat", value: "magichat" },
  { category: "clothing", value: "jk" },
  { category: "glasses", value: "sunglasses" },
  { category: "heldItem", value: "notebook" },
  { category: "hat", value: "chefhat" },
  { category: "clothing", value: "pleated" },
  { category: "glasses", value: "round" },
  { category: "heldItem", value: "paintbrush" },
  { category: "hat", value: "catears" },
  { category: "clothing", value: "petal" },
  { category: "glasses", value: "goggles" },
  { category: "heldItem", value: "moonwand" },
  { category: "hat", value: "beret" },
];

function getWardrobeUnlockKey(category: WardrobeCategory, value: string) {
  return `${category}:${value}`;
}

function getWardrobeUnlockLevel(category: WardrobeCategory, value: string) {
  if (value === "none") return 1;
  const index = BUDDY_WARDROBE_UNLOCK_ORDER.findIndex(
    (entry) => entry.category === category && entry.value === value,
  );
  return index >= 0 ? index + 1 : Number.POSITIVE_INFINITY;
}

function createUnlockedWardrobeSet(level: number) {
  const unlocked = new Set<string>([
    getWardrobeUnlockKey("hat", "none"),
    getWardrobeUnlockKey("clothing", "none"),
    getWardrobeUnlockKey("glasses", "none"),
    getWardrobeUnlockKey("heldItem", "none"),
  ]);

  BUDDY_WARDROBE_UNLOCK_ORDER.slice(0, Math.max(0, level)).forEach((entry) => {
    unlocked.add(getWardrobeUnlockKey(entry.category, entry.value));
  });

  return unlocked;
}

function sanitizeBuddyOutfitForLevel(
  outfit: BuddyOutfit,
  unlockedSet: Set<string>,
): BuddyOutfit {
  return {
    hat: unlockedSet.has(getWardrobeUnlockKey("hat", outfit.hat)) ? outfit.hat : "none",
    clothing: unlockedSet.has(getWardrobeUnlockKey("clothing", outfit.clothing)) ? outfit.clothing : "none",
    glasses: unlockedSet.has(getWardrobeUnlockKey("glasses", outfit.glasses)) ? outfit.glasses : "none",
    heldItem: unlockedSet.has(getWardrobeUnlockKey("heldItem", outfit.heldItem)) ? outfit.heldItem : "none",
  };
}

const buddyWardrobeCopy = {
  hats: {
    none: { zh: "\u4e0d\u6234", en: "Bare Head" },
    sunhat: { zh: "\u906e\u9633\u5e3d", en: "Sun Hat" },
    strawhat: { zh: "\u8349\u5e3d", en: "Straw Hat" },
    cap: { zh: "\u9e2d\u820c\u5e3d", en: "Cap" },
    magichat: { zh: "\u9b54\u672f\u5e3d", en: "Magic Hat" },
    chefhat: { zh: "\u53a8\u5e08\u5e3d", en: "Chef Hat" },
    catears: { zh: "\u732b\u8033\u6735", en: "Cat Ears" },
    beret: { zh: "\u8d1d\u96f7\u5e3d", en: "Beret" },
  } satisfies Record<BuddyHat, { zh: string; en: string }>,
  clothing: {
    none: { zh: "\u9ed8\u8ba4", en: "Default" },
    shorts: { zh: "\u77ed\u88e4", en: "Shorts" },
    jeans: { zh: "\u725b\u4ed4\u88e4", en: "Jeans" },
    bloomers: { zh: "\u706f\u7b3c\u88e4", en: "Bloomers" },
    jk: { zh: "JK\u88d9", en: "JK Skirt" },
    pleated: { zh: "\u767e\u8936\u88d9", en: "Pleated Skirt" },
    petal: { zh: "\u82b1\u74e3\u88d9", en: "Petal Skirt" },
  } satisfies Record<BuddyClothing, { zh: string; en: string }>,
  glasses: {
    none: { zh: "\u4e0d\u6234", en: "None" },
    star: { zh: "\u661f\u661f\u6846", en: "Star Frames" },
    heart: { zh: "\u7231\u5fc3\u6846", en: "Heart Frames" },
    square: { zh: "\u65b9\u5f62\u6846", en: "Square Frames" },
    sunglasses: { zh: "\u58a8\u955c", en: "Sunglasses" },
    round: { zh: "\u5706\u6846\u773c\u955c", en: "Round Frames" },
    goggles: { zh: "\u62a4\u76ee\u955c", en: "Goggles" },
  } satisfies Record<BuddyGlasses, { zh: string; en: string }>,
  heldItems: {
    none: { zh: "\u7a7a\u624b", en: "Empty Hands" },
    flower: { zh: "\u5c0f\u82b1\u675f", en: "Flower" },
    tea: { zh: "\u5976\u8336\u676f", en: "Tea Cup" },
    starwand: { zh: "\u661f\u661f\u68d2", en: "Star Wand" },
    notebook: { zh: "\u5c0f\u7b14\u8bb0\u672c", en: "Notebook" },
    paintbrush: { zh: "\u753b\u7b14", en: "Paintbrush" },
    moonwand: { zh: "\u6708\u4eae\u68d2", en: "Moon Wand" },
  } satisfies Record<BuddyHeldItem, { zh: string; en: string }>,
};

function renderWardrobePreviewIcon(
  category: "hat" | "clothing" | "glasses" | "heldItem",
  value: string,
) {
  return (
    <span className="buddy-wardrobe-option-preview" aria-hidden="true">
      {category === "hat" && value === "none" ? <span className="buddy-preview-none" /> : null}
      {category === "hat" && value === "sunhat" ? (
        <span className="buddy-preview-hat buddy-preview-hat-sun">
          <span className="buddy-preview-hat-top" />
          <span className="buddy-preview-hat-brim" />
        </span>
      ) : null}
      {category === "hat" && value === "strawhat" ? (
        <span className="buddy-preview-hat buddy-preview-hat-straw">
          <span className="buddy-preview-hat-top" />
          <span className="buddy-preview-hat-brim" />
        </span>
      ) : null}
      {category === "hat" && value === "cap" ? (
        <span className="buddy-preview-hat buddy-preview-hat-cap">
          <span className="buddy-preview-hat-top" />
          <span className="buddy-preview-hat-brim" />
        </span>
      ) : null}
      {category === "hat" && value === "magichat" ? (
        <span className="buddy-preview-hat buddy-preview-hat-magic">
          <span className="buddy-preview-hat-top" />
          <span className="buddy-preview-hat-brim" />
        </span>
      ) : null}
      {category === "hat" && value === "chefhat" ? (
        <span className="buddy-preview-hat buddy-preview-hat-chef">
          <span className="buddy-preview-hat-top" />
          <span className="buddy-preview-hat-brim" />
        </span>
      ) : null}
      {category === "hat" && value === "catears" ? <span className="buddy-preview-hat buddy-preview-hat-catears" /> : null}
      {category === "hat" && value === "beret" ? (
        <span className="buddy-preview-hat buddy-preview-hat-beret">
          <span className="buddy-preview-hat-top" />
        </span>
      ) : null}

      {category === "clothing" && value === "none" ? <span className="buddy-preview-none" /> : null}
      {category === "clothing" && value === "shorts" ? <span className="buddy-preview-bottom buddy-preview-bottom-shorts" /> : null}
      {category === "clothing" && value === "jeans" ? <span className="buddy-preview-bottom buddy-preview-bottom-jeans" /> : null}
      {category === "clothing" && value === "bloomers" ? <span className="buddy-preview-bottom buddy-preview-bottom-bloomers" /> : null}
      {category === "clothing" && value === "jk" ? <span className="buddy-preview-bottom buddy-preview-bottom-jk" /> : null}
      {category === "clothing" && value === "pleated" ? <span className="buddy-preview-bottom buddy-preview-bottom-pleated" /> : null}
      {category === "clothing" && value === "petal" ? <span className="buddy-preview-bottom buddy-preview-bottom-petal" /> : null}

      {category === "glasses" && value === "none" ? <span className="buddy-preview-none" /> : null}
      {category === "glasses" && value === "square" ? <span className="buddy-preview-glasses buddy-preview-glasses-square" /> : null}
      {category === "glasses" && value === "sunglasses" ? <span className="buddy-preview-glasses buddy-preview-glasses-sun" /> : null}
      {category === "glasses" && value === "star" ? <span className="buddy-preview-glasses buddy-preview-glasses-star" /> : null}
      {category === "glasses" && value === "heart" ? <span className="buddy-preview-glasses buddy-preview-glasses-heart" /> : null}
      {category === "glasses" && value === "round" ? <span className="buddy-preview-glasses buddy-preview-glasses-round" /> : null}
      {category === "glasses" && value === "goggles" ? <span className="buddy-preview-glasses buddy-preview-glasses-goggles" /> : null}

      {category === "heldItem" && value === "none" ? <span className="buddy-preview-none" /> : null}
      {category === "heldItem" && value === "flower" ? <span className="buddy-preview-held buddy-preview-held-flower" /> : null}
      {category === "heldItem" && value === "tea" ? <span className="buddy-preview-held buddy-preview-held-tea" /> : null}
      {category === "heldItem" && value === "starwand" ? <span className="buddy-preview-held buddy-preview-held-starwand" /> : null}
      {category === "heldItem" && value === "notebook" ? <span className="buddy-preview-held buddy-preview-held-notebook" /> : null}
      {category === "heldItem" && value === "paintbrush" ? <span className="buddy-preview-held buddy-preview-held-paintbrush" /> : null}
      {category === "heldItem" && value === "moonwand" ? <span className="buddy-preview-held buddy-preview-held-moonwand" /> : null}
    </span>
  );
}

export function HomeActionEntry({ locale }: { locale: Locale }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("Learner");
  const [levelPrefix, setLevelPrefix] = useState("A2");
  const [snapshot, setSnapshot] = useState(() => createEmptyLearningTrackerSnapshot());
  const stableInitialDate = new Date("2026-01-01T00:00:00.000Z");
  const [preferences, setPreferences] = useState(() => createDefaultSchedulePreferences(stableInitialDate, locale));
  const [buddyOutfit, setBuddyOutfit] = useState<BuddyOutfit>(() => DEFAULT_BUDDY_OUTFIT);
  const [xpSummary, setXpSummary] = useState(() => createEmptyBuddyXpSummary());
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [wardrobeTab, setWardrobeTab] = useState<"hat" | "clothing" | "glasses" | "heldItem">("hat");
  const [wardrobeFlipTick, setWardrobeFlipTick] = useState(0);
  const [showLevelRules, setShowLevelRules] = useState(false);
  const [levelUpNotice, setLevelUpNotice] = useState<{ level: number; stageTitle: string } | null>(null);
  const levelUpNoticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const refresh = () => {
      setIsLoggedIn(window.localStorage.getItem("demo_logged_in") === "true");
      setDisplayName(toDisplayName(window.localStorage.getItem("demo_user")));
      setLevelPrefix(normalizeLevel(window.localStorage.getItem("demo_level")));
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
      setPreferences(loadSchedulePreferencesFromStorage(locale));
      setBuddyOutfit(loadBuddyOutfitFromStorage());
      setXpSummary(getBuddyXpSummaryFromStorage());
    };

    refresh();
    void hydrateSchedulePreferencesFromServer(locale);
    void fetchBuddyXpSummary()
      .then((summary) => setXpSummary(summary))
      .catch(() => undefined);
    const unsubTracker = subscribeLearningTracker(refresh);
    const unsubPrefs = subscribeSchedulePreferences(refresh);
    const unsubOutfit = subscribeBuddyOutfit(refresh);
    const unsubBuddyXp = subscribeBuddyXpSources(refresh);

    window.addEventListener("storage", refresh);
    window.addEventListener("demo-auth-changed", refresh as EventListener);
    window.addEventListener("demo-placement-changed", refresh as EventListener);

    return () => {
      unsubTracker();
      unsubPrefs();
      unsubOutfit();
      unsubBuddyXp();
      window.removeEventListener("storage", refresh);
      window.removeEventListener("demo-auth-changed", refresh as EventListener);
      window.removeEventListener("demo-placement-changed", refresh as EventListener);
    };
  }, [locale]);

  const weeklySchedule = useMemo(() => {
    const appliedPlans = getActiveWeekPlanOverrides(preferences, new Date());
    return generateWeeklySchedule({
      preferences,
      snapshot,
      reviewDue: 0,
      locale,
      level: levelPrefix,
      planOverrides: appliedPlans,
      useGeneratedFallback: false,
    });
  }, [preferences, snapshot, locale, levelPrefix]);

  const todayPlan = weeklySchedule.days.find((day) => day.isToday) ?? weeklySchedule.days[0];
  const totalSummary = useMemo(() => {
    const skillSnapshots = [
      snapshot.skills.listening,
      snapshot.skills.speaking,
      snapshot.skills.reading,
      snapshot.skills.writing,
    ];
    const totalCompleted = skillSnapshots.reduce((sum, skill) => sum + skill.completed, 0);
    const totalAttempts = skillSnapshots.reduce((sum, skill) => sum + skill.attempts, 0);
    const totalMinutes = Number(
      skillSnapshots.reduce((sum, skill) => sum + skill.minutes, 0).toFixed(1),
    );
    const totalCorrect = skillSnapshots.reduce((sum, skill) => sum + skill.correct, 0);

    return {
      totalCompleted,
      totalAttempts,
      totalMinutes,
      totalCorrect,
      overallAccuracy: getAccuracy(totalCorrect, totalAttempts),
    };
  }, [snapshot]);
  const { totalCompleted, totalAttempts, totalMinutes, overallAccuracy } = totalSummary;

  const xp = xpSummary.totalXp;
  const buddyLevel = getBuddyLevel(xp);
  const levelStartXp = getXpForLevel(buddyLevel);
  const nextLevelXp = getXpForLevel(buddyLevel + 1);
  const levelXpProgress = xp - levelStartXp;
  const levelXpSpan = Math.max(1, nextLevelXp - levelStartXp);
  const currentLevelProgress = clampPercent((levelXpProgress / levelXpSpan) * 100);
  const totalCompletedForBuddy = xpSummary.totalCompletedSources;
  const buddyStage = getBuddyStage(xp, locale);
  const unlockedWardrobeSet = useMemo(() => createUnlockedWardrobeSet(buddyLevel), [buddyLevel]);
  const effectiveBuddyOutfit = useMemo(
    () => sanitizeBuddyOutfitForLevel(buddyOutfit, unlockedWardrobeSet),
    [buddyOutfit, unlockedWardrobeSet],
  );
  const nextQuestHref =
    todayPlan.blocks.find((block) => block.skill !== "review")?.href ?? `/schedule?lang=${locale}`;
  const readingHref = `/reading?lang=${locale}`;
  const writingLevel =
    levelPrefix === "A1" || levelPrefix === "A2" || levelPrefix === "B1" || levelPrefix === "B2"
      ? levelPrefix
      : "B2";
  const writingHref = `/lesson/${writingLevel}-writing-starter?lang=${locale}`;

  const updatePrefs = (partial: Partial<typeof preferences>) => {
    const updated = saveSchedulePreferencesToStorage({ ...preferences, ...partial });
    setPreferences(updated);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !isLoggedIn) return;

    const stored = window.localStorage.getItem(LAST_SEEN_BUDDY_LEVEL_KEY);
    if (stored === null) {
      window.localStorage.setItem(LAST_SEEN_BUDDY_LEVEL_KEY, String(buddyLevel));
      return;
    }

    const previousLevel = Number(stored);
    if (!Number.isFinite(previousLevel)) {
      window.localStorage.setItem(LAST_SEEN_BUDDY_LEVEL_KEY, String(buddyLevel));
      return;
    }

    if (buddyLevel > previousLevel) {
      if (levelUpNoticeTimerRef.current) {
        window.clearTimeout(levelUpNoticeTimerRef.current);
      }
      levelUpNoticeTimerRef.current = window.setTimeout(() => {
        setLevelUpNotice({ level: buddyLevel, stageTitle: buddyStage.title });
        levelUpNoticeTimerRef.current = null;
      }, 0);
      return;
    }

    if (buddyLevel < previousLevel) {
      window.localStorage.setItem(LAST_SEEN_BUDDY_LEVEL_KEY, String(buddyLevel));
    }

    return () => {
      if (levelUpNoticeTimerRef.current) {
        window.clearTimeout(levelUpNoticeTimerRef.current);
        levelUpNoticeTimerRef.current = null;
      }
    };
  }, [buddyLevel, buddyStage.title, isLoggedIn]);

  const updateBuddyOutfit = (partial: Partial<BuddyOutfit>) => {
    const nextOutfit = { ...effectiveBuddyOutfit, ...partial };
    const sanitizedOutfit = sanitizeBuddyOutfitForLevel(nextOutfit, unlockedWardrobeSet);
    const updated = saveBuddyOutfitToStorage(sanitizedOutfit);
    setBuddyOutfit(updated);
  };

  useEffect(() => {
    const differs =
      buddyOutfit.hat !== effectiveBuddyOutfit.hat ||
      buddyOutfit.clothing !== effectiveBuddyOutfit.clothing ||
      buddyOutfit.glasses !== effectiveBuddyOutfit.glasses ||
      buddyOutfit.heldItem !== effectiveBuddyOutfit.heldItem;

    if (!differs) return;

    saveBuddyOutfitToStorage(effectiveBuddyOutfit);
  }, [buddyOutfit, effectiveBuddyOutfit]);

  const handleWardrobeTabChange = (tab: "hat" | "clothing" | "glasses" | "heldItem") => {
    if (tab === wardrobeTab) return;
    setWardrobeTab(tab);
    setWardrobeFlipTick((value) => value + 1);
  };

  const growthRows: Array<{ label: string; value: number; hint: string }> = [
    {
      label: locale === "zh" ? "知识值" : "Knowledge",
      value:
        clampPercent(
          (getAccuracy(snapshot.skills.listening.correct, snapshot.skills.listening.attempts) +
            getAccuracy(snapshot.skills.reading.correct, snapshot.skills.reading.attempts) +
            snapshot.skills.listening.completed * 12 +
            snapshot.skills.reading.completed * 12) /
            2.6,
        ) || 12,
      hint:
        locale === "zh"
          ? "由听力与阅读输入推动。"
          : "Driven by lecture listening and reading input.",
    },
    {
      label: locale === "zh" ? "表达值" : "Voice",
      value:
        clampPercent(
          getAccuracy(snapshot.skills.speaking.correct, snapshot.skills.speaking.attempts) +
            snapshot.skills.speaking.completed * 14,
        ) || 10,
      hint:
        locale === "zh"
          ? "来自场景口语和 AI 对话。"
          : "Boosted by speaking scenes and AI dialogue.",
    },
    {
      label: locale === "zh" ? "写作值" : "Craft",
      value:
        clampPercent(
          getAccuracy(snapshot.skills.writing.correct, snapshot.skills.writing.attempts) +
            snapshot.skills.writing.completed * 12,
        ) || 10,
      hint:
        locale === "zh"
          ? "连接学术表达与输出质量。"
          : "Tied to academic expression and output quality.",
    },
    {
      label: locale === "zh" ? "节奏值" : "Rhythm",
      value: clampPercent((totalMinutes / Math.max(35, weeklySchedule.weeklyTargetMinutes)) * 100),
      hint:
        locale === "zh"
          ? "参考本周目标时长和完成节奏。"
          : "Tracks pace against this week's target minutes.",
    },
  ];

  const weeklyMissions: Array<{
    title: string;
    note: string;
    progress: number;
    target: number;
    href: string;
  }> = [
    {
      title: locale === "zh" ? "资源库冲刺" : "Library Sprint",
      note:
        locale === "zh"
          ? "完成 2 个听力资源卡片，给 Buddy 加知识值。"
          : "Finish 2 listening cards to feed your buddy's knowledge bar.",
      progress: Math.min(snapshot.skills.listening.completed, 2),
      target: 2,
      href: `/listening?lang=${locale}`,
    },
    {
      title: locale === "zh" ? "场景回应" : "Scene Reply",
      note:
        locale === "zh"
          ? "做 1 次口语场景练习，提升 Voice。"
          : "Run 1 speaking scene to raise the voice stat.",
      progress: Math.min(snapshot.skills.speaking.completed, 1),
      target: 1,
      href: `/lesson/${levelPrefix}-speaking-starter?lang=${locale}`,
    },
    {
      title: locale === "zh" ? "每周节奏" : "Weekly Rhythm",
      note:
        locale === "zh"
          ? "本周学习时长达到目标值。"
          : "Reach your target minutes for this week.",
      progress: Math.min(Math.round(totalMinutes), weeklySchedule.weeklyTargetMinutes),
      target: weeklySchedule.weeklyTargetMinutes,
      href: `/schedule?lang=${locale}`,
    },
  ];

  const levelRuleRows = Array.from({ length: 3 }, (_, index) => ({
    level: index + 1,
    nextLevel: index + 2,
    neededXp: getXpNeededForNextLevel(index + 1),
  }));

  if (!isLoggedIn) {
    return (
      <section className="mt-6 grid gap-5 reveal-up">
        <article className="sky-panel rounded-[2.5rem] px-6 pb-7 pt-4 sm:px-8 sm:pb-9 sm:pt-5">
          <span className="party-floater right-8 top-10 h-12 w-12">
            <Trophy className="size-5" />
          </span>
          <span className="party-floater bottom-[4.5rem] right-[28%] h-10 w-10">
            <Mic className="size-4.5" />
          </span>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="buddy-chip">
                  <Sparkles className="size-4 text-[var(--navy)]" />
                  {locale === "zh" ? "卡通学伴校园" : "Cartoon Buddy Campus"}
                </span>
                <span className="buddy-chip">
                  <PawPrint className="size-4 text-[var(--coral)]" />
                  {locale === "zh" ? "桌宠成长系统" : "Pet growth system"}
                </span>
              </div>

              <h2 className="font-display game-title mt-3 max-w-3xl text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
                {locale === "zh"
                  ? "为 DIICSU 新生打造的英语冒险校园。"
                  : "A DIICSU English adventure campus built for first-year students."}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
                {locale === "zh"
                  ? "把工科学术听力、学术口语、论坛互动和每周挑战放进一个更友好、更有吸引力的卡通校园里。你的 Buddy 会随着学习逐步成长。"
                  : "Academic listening, academic speaking, community tasks, and weekly quests all live inside one playful campus. Your buddy grows as you keep learning."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/register?lang=${locale}`} className="party-button">
                  {locale === "zh" ? "创建你的学伴" : "Create your buddy"}
                  <ArrowRight className="size-4" />
                </Link>
                <Link href={readingHref} className="party-button-ghost">
                  <FileText className="size-4" />
                  {locale === "zh" ? "打开阅读" : "Open Reading"}
                </Link>
                <Link href={writingHref} className="party-button-ghost">
                  <PenLine className="size-4" />
                  {locale === "zh" ? "打开写作" : "Open Writing"}
                </Link>
                <Link href={`/placement-test?lang=${locale}`} className="party-button-ghost">
                  {locale === "zh" ? "开始分级测试" : "Start placement test"}
                </Link>
                <Link href={`/games?lang=${locale}`} className="party-button-ghost">
                  <Gamepad2 className="size-4" />
                  {locale === "zh" ? "试玩游戏中心" : "Preview Game Center"}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {majorStickers.map((item) => (
                  <span key={item} className="pet-sticker">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="mx-auto max-w-[24rem] rounded-[2.2rem] border-2 border-white/90 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_16px_0_rgba(255,201,225,0.26),0_28px_56px_rgba(90,123,255,0.14)] backdrop-blur-xl">
                <div className="buddy-bubble p-4">
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {locale === "zh"
                      ? "Hi, I am your DIICSU Buddy. Finish quests and I will grow with you."
                      : "Hi, I am your DIICSU Buddy. Finish quests and I will grow with you."}
                  </p>
                </div>
                <div className="party-stage mt-4 px-5 pb-5 pt-3">
                  <div className="pet-spotlight" />
                  <BuddyCompanion
                    stage="fresh"
                    focus={getGoalFocus(preferences.goal)}
                    variant={getGoalVariant(preferences.goal)}
                    mood="happy"
                    outfit={buddyOutfit}
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: locale === "zh" ? "学术听力库" : "Academic Listening",
              note:
                locale === "zh"
                  ? "按专业、来源机构、口音和难度浏览材料；支持站内播放，也支持看文本后答题。"
                  : "Browse by major, provider, accent, and difficulty, then watch in-app or read before answering.",
              Icon: Headphones,
            },
            {
              title: locale === "zh" ? "AI 口语场景" : "AI Speaking Scenes",
              note:
                locale === "zh"
                  ? "让 AI 扮演 tutor、classmate、team leader。"
                  : "Let AI act as a tutor, classmate, or team leader in speaking tasks.",
              Icon: WandSparkles,
            },
            {
              title: locale === "zh" ? "每周学伴任务" : "Weekly Buddy Missions",
              note:
                locale === "zh"
                  ? "通过 XP、成长和任务板让学生更愿意回来。"
                  : "Bring students back with XP, growth, and a weekly mission board.",
              Icon: Trophy,
            },
          ].map((item) => (
            <article
              key={item.title}
              className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.98),rgba(244,248,255,0.92),rgba(255,242,247,0.86))] p-5"
            >
              <div className="quest-orb h-12 w-12">
                <item.Icon className="size-5 text-[var(--navy)]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.note}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 grid gap-5 reveal-up">
      <article className="sky-panel rounded-[2.5rem] px-6 pb-7 pt-4 sm:px-8 sm:pb-8 sm:pt-5">
        <span className="party-floater right-10 top-11 h-12 w-12">
          <Trophy className="size-5" />
        </span>
        <span className="party-floater bottom-16 right-[32%] h-10 w-10">
          <Compass className="size-4.5" />
        </span>
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="buddy-chip">
                  <Sparkles className="size-4 text-[var(--navy)]" />
                  {buddyStage.title}
                </span>
                <span className="buddy-chip">
                  <Target className="size-4 text-[var(--teal)]" />
                  {getGoalLabel(preferences.goal, locale)}
                </span>
                <span className="buddy-chip">
                  <Flame className="size-4 text-[var(--coral)]" />
                  XP {xp}
                </span>
              </div>
              <LanguageSwitcher locale={locale} />
            </div>

            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              {locale === "zh" ? "欢迎回来" : "Welcome back"} · {getStageLabel(levelPrefix, locale)} · {levelPrefix}
            </p>
            <h2 className="font-display game-title mt-2 max-w-3xl text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
              {locale === "zh"
                ? `你好，${displayName}。今天让你的 Buddy 再进化一点。`
                : `Hi, ${displayName}. Let's help your buddy evolve a little more today.`}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={nextQuestHref} className="party-button">
                {locale === "zh" ? "开始今日任务" : "Start today's quest"}
                <ArrowRight className="size-4" />
              </Link>
              <Link href={readingHref} className="party-button-ghost">
                <FileText className="size-4" />
                {locale === "zh" ? "打开阅读" : "Open Reading"}
              </Link>
              <Link href={writingHref} className="party-button-ghost">
                <PenLine className="size-4" />
                {locale === "zh" ? "打开写作" : "Open Writing"}
              </Link>
              <Link href={`/discussion?lang=${locale}`} className="party-button-ghost">
                {locale === "zh" ? "打开学伴广场" : "Open Buddy Square"}
              </Link>
              <Link href={`/games?lang=${locale}`} className="party-button-ghost">
                <Gamepad2 className="size-4" />
                {locale === "zh" ? "打开游戏中心" : "Open Game Center"}
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {majorStickers.map((item) => (
                <span key={item} className="pet-sticker">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            {levelUpNotice ? (
              <div className="absolute right-4 top-4 z-20 w-[min(20rem,calc(100%-1rem))]">
                <div className="rounded-[1.45rem] border-2 border-white/92 bg-[linear-gradient(160deg,rgba(255,255,255,0.99),rgba(241,247,255,0.97),rgba(255,241,248,0.95))] p-5 shadow-[0_14px_0_rgba(143,196,255,0.16),0_24px_38px_rgba(90,123,255,0.14)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        {locale === "zh" ? "Buddy 升级了" : "Buddy leveled up"}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                        {locale === "zh"
                          ? `升级到 Level ${levelUpNotice.level}`
                          : `Level ${levelUpNotice.level} reached`}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{levelUpNotice.stageTitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLevelUpNotice(null);
                        window.localStorage.setItem(LAST_SEEN_BUDDY_LEVEL_KEY, String(buddyLevel));
                      }}
                      className="pointer-events-auto rounded-full border-2 border-white/90 bg-white/88 px-3 py-1.5 text-sm font-semibold text-[var(--ink)] shadow-[0_8px_0_rgba(143,196,255,0.14)]"
                    >
                      {locale === "zh" ? "关闭" : "Close"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="mx-auto max-w-[26rem] rounded-[2.2rem] border-2 border-white/90 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_16px_0_rgba(255,201,225,0.26),0_28px_56px_rgba(90,123,255,0.14)] backdrop-blur-xl">
              <div className="buddy-bubble p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">{buddyStage.note}</p>
              </div>

              <div className="party-stage mt-4 px-5 pb-5 pt-3">
                <div className="pet-spotlight" />
                {levelUpNotice ? (
                  <>
                    <span className="global-buddy-star global-buddy-star-one !left-[24%] !top-[2rem]">✦</span>
                    <span className="global-buddy-star global-buddy-star-two !right-[23%] !top-[2.5rem]">✦</span>
                    <span className="global-buddy-star global-buddy-star-three !right-[31%] !top-[5rem]">✦</span>
                  </>
                ) : null}
                <button
                  type="button"
                    onClick={() => setWardrobeOpen(true)}
                  className={`buddy-dressup-trigger mx-auto block rounded-[1.8rem] border-0 bg-transparent p-0${
                    levelUpNotice ? " animate-[globalBuddyBounceHit_1s_ease-in-out_5]" : ""
                  }`}
                  aria-label={locale === "zh" ? "打开桌宠换装" : "Open buddy wardrobe"}
                >
                  <BuddyCompanion
                    stage={buddyStage.id}
                    focus={getGoalFocus(preferences.goal)}
                    variant={getGoalVariant(preferences.goal)}
                    mood={buddyStage.mood}
                    outfit={effectiveBuddyOutfit}
                    className="mx-auto"
                  />
                </button>
                <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                  {locale === "zh" ? "点击桌宠换装" : "Tap buddy to dress up"}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.45rem] border-2 border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(232,244,255,0.92))] p-3 shadow-[0_8px_0_rgba(143,196,255,0.2),0_16px_24px_rgba(90,123,255,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    {locale === "zh" ? "等级" : "Level"}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{buddyLevel}</p>
                </div>
                <div className="rounded-[1.45rem] border-2 border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,255,248,0.92))] p-3 shadow-[0_8px_0_rgba(143,240,211,0.2),0_16px_24px_rgba(90,123,255,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">XP</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{xp}</p>
                </div>
                <div className="rounded-[1.45rem] border-2 border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,243,247,0.94))] p-3 shadow-[0_8px_0_rgba(255,201,225,0.24),0_16px_24px_rgba(90,123,255,0.08)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    {locale === "zh" ? "已完成任务" : "Tasks done"}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{totalCompletedForBuddy}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[var(--ink)]">
                    {locale === "zh" ? "XP 进度" : "XP progress"}
                  </span>
                  <span className="text-[var(--ink-soft)]">
                    {levelXpProgress} / {levelXpSpan}
                  </span>
                </div>
                <div className="buddy-stage-bar h-3">
                  <div className="buddy-progress-fill" style={{ width: `${currentLevelProgress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--ink-soft)]">
                  <span>
                    {locale === "zh" ? `当前等级 ${buddyLevel}` : `Current level ${buddyLevel}`}
                  </span>
                  <span>
                    {locale === "zh" ? `下一级 ${buddyLevel + 1}` : `Next level ${buddyLevel + 1}`}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowLevelRules(true)}
                    className="party-button-ghost !px-3 !py-2 !text-sm"
                  >
                    <CircleHelp className="size-4" />
                    {locale === "zh" ? "查看升级规则" : "View level rules"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {showLevelRules ? (
        <div className="fixed inset-0 z-[70] bg-transparent" onClick={() => setShowLevelRules(false)}>
          <div
            className="absolute right-[max(1.25rem,calc(50%-35rem))] top-[17.5rem] w-[min(24rem,calc(100vw-2rem))] rounded-[1.7rem] border-2 border-white/90 bg-[linear-gradient(165deg,rgba(255,255,255,0.99),rgba(241,247,255,0.97),rgba(255,246,250,0.94))] p-4 shadow-[0_14px_0_rgba(255,201,225,0.18),0_24px_40px_rgba(90,123,255,0.14)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label">
                  <PawPrint className="size-3.5" />
                  {locale === "zh" ? "宠物升级规则" : "Buddy level rules"}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  {locale === "zh"
                    ? `第 1 次升级需要 ${LEVEL_XP_BASE} XP，之后每升一级固定多 ${LEVEL_XP_STEP} XP。`
                    : `The first level-up needs ${LEVEL_XP_BASE} XP, and each later level needs ${LEVEL_XP_STEP} more XP than the one before.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLevelRules(false)}
                className="rounded-full border-2 border-white/90 bg-white/88 px-3 py-1.5 text-sm font-semibold text-[var(--ink)] shadow-[0_8px_0_rgba(143,196,255,0.14)]"
              >
                {locale === "zh" ? "关闭" : "Close"}
              </button>
            </div>

            <div className="mt-4 grid gap-2.5">
              {levelRuleRows.map((rule) => (
                <div
                  key={rule.level}
                  className="rounded-[1.2rem] border-2 border-white/90 bg-[rgba(255,255,255,0.84)] px-4 py-3 shadow-[0_8px_0_rgba(143,196,255,0.12),0_14px_20px_rgba(90,123,255,0.07)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {locale === "zh"
                        ? `例：等级 ${rule.level} -> ${rule.nextLevel}`
                        : `Example: Level ${rule.level} -> ${rule.nextLevel}`}
                    </p>
                    <span className="buddy-chip !px-3 !py-1">{rule.neededXp} XP</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[1.2rem] border-2 border-white/90 bg-[rgba(255,255,255,0.84)] px-4 py-3 shadow-[0_8px_0_rgba(143,196,255,0.12),0_14px_20px_rgba(90,123,255,0.07)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                {locale === "zh" ? "固定 XP 来源" : "Fixed XP sources"}
              </p>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ink)]">
                <p>{locale === "zh" ? `Listening 完成 +${BUDDY_XP_RULES.listeningCompletion} XP` : `Listening completion +${BUDDY_XP_RULES.listeningCompletion} XP`}</p>
                <p>{locale === "zh" ? `Speaking 完成 +${BUDDY_XP_RULES.speakingCompletion} XP` : `Speaking completion +${BUDDY_XP_RULES.speakingCompletion} XP`}</p>
                <p>{locale === "zh" ? `Reading 完成 +${BUDDY_XP_RULES.readingCompletion} XP` : `Reading completion +${BUDDY_XP_RULES.readingCompletion} XP`}</p>
                <p>{locale === "zh" ? `Writing 完成 +${BUDDY_XP_RULES.writingCompletion} XP` : `Writing completion +${BUDDY_XP_RULES.writingCompletion} XP`}</p>
                <p>{locale === "zh" ? `Review 完成 +${BUDDY_XP_RULES.reviewSession} XP` : `Review completion +${BUDDY_XP_RULES.reviewSession} XP`}</p>
                <p>{locale === "zh" ? `Word Game 通关 +${BUDDY_XP_RULES.wordGameClear} XP` : `Word game clear +${BUDDY_XP_RULES.wordGameClear} XP`}</p>
                <p>{locale === "zh" ? `Quest Arcade 通关 +${BUDDY_XP_RULES.escapeRoomClear} XP` : `Quest Arcade clear +${BUDDY_XP_RULES.escapeRoomClear} XP`}</p>
                <p>{locale === "zh" ? `Dorm Lockout 通关 +${BUDDY_XP_RULES.dormLockoutClear} XP` : `Dorm Lockout clear +${BUDDY_XP_RULES.dormLockoutClear} XP`}</p>
                <p>{locale === "zh" ? `Last Train Escape 通关 +${BUDDY_XP_RULES.lastTrainClear} XP` : `Last Train Escape clear +${BUDDY_XP_RULES.lastTrainClear} XP`}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {wardrobeOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="buddy-wardrobe-overlay" role="dialog" aria-modal="true">
              <div className="buddy-wardrobe-panel">
                <button
                  type="button"
                  onClick={() => setWardrobeOpen(false)}
                  className="buddy-wardrobe-close"
                  aria-label={locale === "zh" ? "关闭换装面板" : "Close wardrobe"}
                >
                  ×
                </button>

                <div className="buddy-wardrobe-layout mt-6">
                  <div className="buddy-wardrobe-tabs">
                    {(
                      [
                        ["hat", locale === "zh" ? "帽子" : "Hats", HatGlasses],
                        ["clothing", locale === "zh" ? "服装" : "Bottoms", Shirt],
                        ["glasses", locale === "zh" ? "眼镜" : "Glasses", Glasses],
                        ["heldItem", locale === "zh" ? "手持物" : "Handhelds", Hand],
                      ] as const
                    ).map(([tab, label, Icon]) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleWardrobeTabChange(tab)}
                        className={`buddy-wardrobe-tab${wardrobeTab === tab ? " buddy-wardrobe-tab-active" : ""}`}
                      >
                        <Icon className="buddy-wardrobe-tab-icon size-4.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="buddy-wardrobe-page buddy-wardrobe-page-left">
                    <p className="section-label">
                      <Sparkles className="size-3.5" />
                      {locale === "zh" ? "Buddy 换装间" : "Buddy Wardrobe"}
                    </p>
                    <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
                      {locale === "zh" ? "给你的学伴挑一套今天的造型" : "Pick today's look for your buddy"}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                      {locale === "zh"
                        ? "帽子、下半身服装和手持物都可以自由搭配，当前分类的选项就显示在这一页。"
                        : "Mix hats, lower-body outfits, and handheld props freely. The current category appears right on this page."}
                    </p>

                    <div key={`options-${wardrobeTab}-${wardrobeFlipTick}`} className="buddy-wardrobe-options buddy-wardrobe-page-flip mt-6">
                      {wardrobeTab === "hat"
                        ? (Object.entries(buddyWardrobeCopy.hats) as Array<[BuddyHat, { zh: string; en: string }]>).map(([key, copy]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => updateBuddyOutfit({ hat: key })}
                              disabled={!unlockedWardrobeSet.has(getWardrobeUnlockKey("hat", key))}
                              className={`buddy-wardrobe-option${effectiveBuddyOutfit.hat === key ? " buddy-wardrobe-option-active" : ""}${!unlockedWardrobeSet.has(getWardrobeUnlockKey("hat", key)) ? " buddy-wardrobe-option-locked" : ""}`}
                            >
                              {renderWardrobePreviewIcon("hat", key)}
                              <span className="min-w-0 flex-1">
                                <span className="block">{copy[locale]}</span>
                                {!unlockedWardrobeSet.has(getWardrobeUnlockKey("hat", key)) ? (
                                  <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                                    <Lock className="size-3" />
                                    {locale === "zh" ? `等级 ${getWardrobeUnlockLevel("hat", key)} 解锁` : `Unlocks at Lv ${getWardrobeUnlockLevel("hat", key)}`}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          ))
                        : null}
                      {wardrobeTab === "clothing"
                        ? (Object.entries(buddyWardrobeCopy.clothing) as Array<[BuddyClothing, { zh: string; en: string }]>).map(([key, copy]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => updateBuddyOutfit({ clothing: key })}
                              disabled={!unlockedWardrobeSet.has(getWardrobeUnlockKey("clothing", key))}
                              className={`buddy-wardrobe-option${effectiveBuddyOutfit.clothing === key ? " buddy-wardrobe-option-active" : ""}${!unlockedWardrobeSet.has(getWardrobeUnlockKey("clothing", key)) ? " buddy-wardrobe-option-locked" : ""}`}
                            >
                              {renderWardrobePreviewIcon("clothing", key)}
                              <span className="min-w-0 flex-1">
                                <span className="block">{copy[locale]}</span>
                                {!unlockedWardrobeSet.has(getWardrobeUnlockKey("clothing", key)) ? (
                                  <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                                    <Lock className="size-3" />
                                    {locale === "zh" ? `等级 ${getWardrobeUnlockLevel("clothing", key)} 解锁` : `Unlocks at Lv ${getWardrobeUnlockLevel("clothing", key)}`}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          ))
                        : null}
                      {wardrobeTab === "glasses"
                        ? (Object.entries(buddyWardrobeCopy.glasses) as Array<[BuddyGlasses, { zh: string; en: string }]>).map(([key, copy]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => updateBuddyOutfit({ glasses: key })}
                              disabled={!unlockedWardrobeSet.has(getWardrobeUnlockKey("glasses", key))}
                              className={`buddy-wardrobe-option${effectiveBuddyOutfit.glasses === key ? " buddy-wardrobe-option-active" : ""}${!unlockedWardrobeSet.has(getWardrobeUnlockKey("glasses", key)) ? " buddy-wardrobe-option-locked" : ""}`}
                            >
                              {renderWardrobePreviewIcon("glasses", key)}
                              <span className="min-w-0 flex-1">
                                <span className="block">{copy[locale]}</span>
                                {!unlockedWardrobeSet.has(getWardrobeUnlockKey("glasses", key)) ? (
                                  <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                                    <Lock className="size-3" />
                                    {locale === "zh" ? `等级 ${getWardrobeUnlockLevel("glasses", key)} 解锁` : `Unlocks at Lv ${getWardrobeUnlockLevel("glasses", key)}`}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          ))
                        : null}
                      {wardrobeTab === "heldItem"
                        ? (Object.entries(buddyWardrobeCopy.heldItems) as Array<[BuddyHeldItem, { zh: string; en: string }]>).map(([key, copy]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => updateBuddyOutfit({ heldItem: key })}
                              disabled={!unlockedWardrobeSet.has(getWardrobeUnlockKey("heldItem", key))}
                              className={`buddy-wardrobe-option${effectiveBuddyOutfit.heldItem === key ? " buddy-wardrobe-option-active" : ""}${!unlockedWardrobeSet.has(getWardrobeUnlockKey("heldItem", key)) ? " buddy-wardrobe-option-locked" : ""}`}
                            >
                              {renderWardrobePreviewIcon("heldItem", key)}
                              <span className="min-w-0 flex-1">
                                <span className="block">{copy[locale]}</span>
                                {!unlockedWardrobeSet.has(getWardrobeUnlockKey("heldItem", key)) ? (
                                  <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                                    <Lock className="size-3" />
                                    {locale === "zh" ? `等级 ${getWardrobeUnlockLevel("heldItem", key)} 解锁` : `Unlocks at Lv ${getWardrobeUnlockLevel("heldItem", key)}`}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          ))
                        : null}
                    </div>
                  </div>

                  <div
                    key={`preview-${wardrobeTab}-${wardrobeFlipTick}`}
                    className="buddy-wardrobe-page buddy-wardrobe-page-right buddy-wardrobe-preview buddy-wardrobe-page-flip"
                  >
                    <div className="party-stage px-5 pb-5 pt-3">
                      <div className="pet-spotlight" />
                      <BuddyCompanion
                        stage={buddyStage.id}
                        focus={getGoalFocus(preferences.goal)}
                        variant={getGoalVariant(preferences.goal)}
                        mood="happy"
                        outfit={effectiveBuddyOutfit}
                        className="mx-auto"
                      />
                    </div>
                    <div className="buddy-bubble mt-4 p-4">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {locale === "zh"
                          ? `当前搭配：${buddyWardrobeCopy.hats[effectiveBuddyOutfit.hat].zh} / ${buddyWardrobeCopy.clothing[effectiveBuddyOutfit.clothing].zh} / ${buddyWardrobeCopy.glasses[effectiveBuddyOutfit.glasses].zh} / ${buddyWardrobeCopy.heldItems[effectiveBuddyOutfit.heldItem].zh}`
                          : `Current look: ${buddyWardrobeCopy.hats[effectiveBuddyOutfit.hat].en} / ${buddyWardrobeCopy.clothing[effectiveBuddyOutfit.clothing].en} / ${buddyWardrobeCopy.glasses[effectiveBuddyOutfit.glasses].en} / ${buddyWardrobeCopy.heldItems[effectiveBuddyOutfit.heldItem].en}`}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBuddyOutfit(saveBuddyOutfitToStorage(DEFAULT_BUDDY_OUTFIT));
                        }}
                        className="party-button-ghost"
                      >
                        {locale === "zh" ? "恢复默认" : "Reset"}
                      </button>
                      <button type="button" onClick={() => setWardrobeOpen(false)} className="party-button">
                        {locale === "zh" ? "完成搭配" : "Done"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <BuddyCampusLobby
        locale={locale}
        levelPrefix={levelPrefix}
        nextQuestHref={nextQuestHref}
        buddyStage={buddyStage.id}
        buddyFocus={getGoalFocus(preferences.goal)}
        buddyOutfit={buddyOutfit}
        selectedGoal={preferences.goal}
        onSelectGoal={(goal) => updatePrefs({ goal })}
      />

      <HomeLearningModules locale={locale} />

      <div className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <article className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.98),rgba(246,250,255,0.92),rgba(255,241,248,0.88))] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">
                <Compass className="size-3.5" />
                {locale === "zh" ? "今日任务" : "Today's Quests"}
              </p>
              <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
                {locale === "zh" ? "从最重要的 3 个任务开始。" : "Start with the 3 quests that matter most."}
              </h3>
            </div>
            <Link href={`/schedule?lang=${locale}`} className="pet-sticker">
              <CalendarDays className="mr-1 size-3.5" />
              {locale === "zh" ? "完整计划" : "Full plan"}
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {todayPlan.blocks.slice(0, 3).map((block, index) => {
              const visual = getQuestVisual(block.skill);
              return (
                <div
                  key={block.id}
                  className="rounded-[1.6rem] border border-[rgba(42,107,180,0.1)] bg-white/88 p-4 shadow-[0_14px_32px_rgba(42,107,180,0.06)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`quest-orb h-12 w-12 rounded-[1rem] bg-gradient-to-br ${visual.iconBg}`}>
                        <visual.Icon className="size-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={index === 0 ? "mission-badge mission-badge-win" : "mission-badge mission-badge-live"}>
                            {index === 0 ? (locale === "zh" ? "主任务" : "Main quest") : locale === "zh" ? "支线任务" : "Side quest"}
                          </span>
                          <p className="text-sm font-semibold text-[var(--ink)]">{block.title}</p>
                        </div>
                        <p className="mt-1 text-sm text-[var(--ink-soft)]">
                          {block.minutes} min · {block.timeLabel || (locale === "zh" ? "灵活安排" : "Flexible")}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{block.reason}</p>
                      </div>
                    </div>
                    <Link
                      href={block.href}
                      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(42,107,180,0.16)] ${visual.accent}`}
                    >
                      {locale === "zh" ? "进入任务" : "Launch"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {todayPlan.blocks.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-[rgba(42,107,180,0.16)] bg-white/70 p-5 text-sm text-[var(--ink-soft)]">
                {locale === "zh"
                  ? "今天还没有生成任务，你可以先去设置计划或打开资源库。"
                  : "No quests are queued yet. Open your planner or jump into the library first."}
              </div>
            ) : null}
          </div>
        </article>

        <article className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.98),rgba(248,247,255,0.92),rgba(237,254,248,0.9))] p-6">
          <p className="section-label">
            <Trophy className="size-3.5" />
            {locale === "zh" ? "每周任务板" : "Weekly Mission Board"}
          </p>
          <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            {locale === "zh" ? "让 Buddy 每周都稳定成长。" : "Give your buddy a reason to grow every week."}
          </h3>

          <div className="mt-5 grid gap-3">
            {weeklyMissions.map((mission) => {
              const ratio = clampPercent((mission.progress / Math.max(1, mission.target)) * 100);
              const done = mission.progress >= mission.target;
              return (
                <div
                  key={mission.title}
                  className="rounded-[1.4rem] border border-[rgba(42,107,180,0.1)] bg-white/88 p-4 shadow-[0_14px_32px_rgba(42,107,180,0.06)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={done ? "mission-badge mission-badge-win" : "mission-badge mission-badge-live"}>
                          {done ? (locale === "zh" ? "已完成" : "Done") : locale === "zh" ? "进行中" : "In progress"}
                        </span>
                        <h4 className="text-sm font-semibold text-[var(--ink)]">{mission.title}</h4>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{mission.note}</p>
                    </div>
                    <Link href={mission.href} className="pet-sticker shrink-0">
                      {locale === "zh" ? "打开" : "Open"}
                    </Link>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[var(--ink-soft)]">
                      <span>
                        {mission.progress} / {mission.target}
                      </span>
                      <span>{ratio}%</span>
                    </div>
                    <div className="buddy-stage-bar h-2.5">
                      <div className="buddy-progress-fill" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.98),rgba(255,244,248,0.92),rgba(244,248,255,0.9))] p-6">
          <p className="section-label">
            <PawPrint className="size-3.5" />
            {locale === "zh" ? "学伴成长" : "Buddy Growth"}
          </p>
          <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            {locale === "zh" ? "宠物成长跟着学习数据走。" : "The pet grows with your learning signals."}
          </h3>

          <div className="mt-5 grid gap-4">
            {growthRows.map((row) => (
              <div key={row.label} className="rounded-[1.4rem] border border-[rgba(42,107,180,0.1)] bg-white/88 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">{row.label}</p>
                  <p className="text-sm font-semibold text-[var(--ink-soft)]">{row.value}%</p>
                </div>
                <div className="mt-3 buddy-stage-bar h-2.5">
                  <div className="buddy-progress-fill" style={{ width: `${row.value}%` }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{row.hint}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-5">
          <article className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.98),rgba(243,248,255,0.92),rgba(255,247,239,0.9))] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-label">
                  <Sparkles className="size-3.5" />
                  {locale === "zh" ? "任务控制台" : "Mission Controls"}
                </p>
                <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
                  {locale === "zh" ? "直接调整学习模式。" : "Tune the study loop directly from home."}
                </h3>
              </div>
              <Link href={`/schedule?lang=${locale}`} className="pet-sticker">
                {locale === "zh" ? "打开计划页" : "Open planner"}
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  {locale === "zh" ? "目标" : "Goal"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["coursework", "research", "seminar"] as ScheduleGoal[]).map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => updatePrefs({ goal })}
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                        preferences.goal === goal
                          ? "bg-[linear-gradient(135deg,#2a6bb4,#55b2ff)] text-white shadow-[0_10px_20px_rgba(42,107,180,0.18)]"
                          : "border border-[rgba(42,107,180,0.12)] bg-white text-[var(--ink)] hover:bg-[rgba(145,220,255,0.14)]"
                      }`}
                    >
                      {getGoalLabel(goal, locale)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  {locale === "zh" ? "强度" : "Intensity"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["light", "standard", "intensive"] as ScheduleMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updatePrefs({ mode })}
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                        preferences.mode === mode
                          ? "bg-[linear-gradient(135deg,#2a6bb4,#55b2ff)] text-white shadow-[0_10px_20px_rgba(42,107,180,0.18)]"
                          : "border border-[rgba(42,107,180,0.12)] bg-white text-[var(--ink)] hover:bg-[rgba(145,220,255,0.14)]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  {locale === "zh" ? "学习时段" : "Study Window"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["early", "midday", "evening"] as StudyWindow[]).map((windowName) => (
                    <button
                      key={windowName}
                      type="button"
                      onClick={() => updatePrefs({ studyWindow: windowName })}
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                        preferences.studyWindow === windowName
                          ? "bg-[linear-gradient(135deg,#2a6bb4,#55b2ff)] text-white shadow-[0_10px_20px_rgba(42,107,180,0.18)]"
                          : "border border-[rgba(42,107,180,0.12)] bg-white text-[var(--ink)] hover:bg-[rgba(145,220,255,0.14)]"
                      }`}
                    >
                      {windowName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="campus-card bg-[linear-gradient(165deg,rgba(255,255,255,0.98),rgba(242,249,255,0.92),rgba(246,255,247,0.9))] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-label">
                  <CalendarDays className="size-3.5" />
                  {locale === "zh" ? "本周节奏" : "Campus Week"}
                </p>
                <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
                  {locale === "zh" ? "本周学习节奏一眼可见。" : "See the week rhythm at a glance."}
                </h3>
              </div>
              <span className="pet-sticker">
                {locale === "zh" ? "目标" : "Target"} {weeklySchedule.weeklyTargetMinutes} min
              </span>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2">
              {weeklySchedule.days.map((day) => (
                <Link
                  key={day.dateISO}
                  href={`/schedule?lang=${locale}&focus=${encodeURIComponent(day.dateISO)}#schedule-week`}
                  className={`rounded-[1.15rem] border p-3 text-center transition ${
                    day.isToday
                      ? "border-[rgba(42,107,180,0.32)] bg-[rgba(145,220,255,0.18)]"
                      : "border-[rgba(42,107,180,0.1)] bg-white/88 hover:bg-[rgba(145,220,255,0.14)]"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    {weekdayNames[day.day]}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{day.targetMinutes}</p>
                  <p className="mt-1 text-[10px] text-[var(--ink-soft)]">{day.deadlines.length} due</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </div>

    </section>
  );
}
