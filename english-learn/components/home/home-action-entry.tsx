"use client";

// AI-assisted authorship note: the 2026 Buddy Campus home refresh in this module
// was drafted with AI help and then reviewed, edited, and integrated by the team.

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CircleHelp,
  Compass,
  Flame,
  FileText,
  Gamepad2,
  Glasses,
  GraduationCap,
  Hand,
  HatGlasses,
  Headphones,
  Library,
  LibraryBig,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Mic,
  PawPrint,
  PenLine,
  Sparkles,
  Shirt,
  Target,
  Trophy,
  User,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";

import { InstitutionBrand } from "@/components/institution-brand";
import { BuddyCampusLobby } from "@/components/home/buddy-campus-lobby";
import { BuddyCompanion, type BuddyFace, type BuddyVariant } from "@/components/home/buddy-companion";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BUDDY_XP_RULES } from "@/lib/buddy-xp-config";
import { type Locale } from "@/lib/i18n/dictionaries";
import {
  createEmptyLearningTrackerSnapshot,
  loadLearningTrackerSnapshotFromStorage,
  subscribeLearningTracker,
} from "@/lib/learning-tracker";
import {
  DEFAULT_BUDDY_VARIANT,
  DEFAULT_BUDDY_OUTFIT,
  loadBuddyOutfitFromStorage,
  loadBuddyVariantFromStorage,
  saveBuddyOutfitToStorage,
  saveBuddyVariantToStorage,
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
const BUDDY_IDENTITY_TIERS = [
  {
    minLevel: 1,
    maxLevel: 4,
    zh: "初学者",
    en: "Beginner",
  },
  {
    minLevel: 5,
    maxLevel: 9,
    zh: "进阶学伴",
    en: "Intermediate Buddy",
  },
  {
    minLevel: 10,
    maxLevel: 14,
    zh: "校园探索者",
    en: "Campus Explorer",
  },
  {
    minLevel: 15,
    maxLevel: 19,
    zh: "研讨参与者",
    en: "Seminar Contributor",
  },
  {
    minLevel: 20,
    maxLevel: 24,
    zh: "研究伙伴",
    en: "Research Partner",
  },
  {
    minLevel: 25,
    maxLevel: Number.POSITIVE_INFINITY,
    zh: "DIICSU 学院之星",
    en: "DIICSU Star",
  },
] as const;

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

function getBuddyIdentity(level: number, locale: Locale) {
  const matchedTier =
    BUDDY_IDENTITY_TIERS.find((tier) => level >= tier.minLevel && level <= tier.maxLevel) ??
    BUDDY_IDENTITY_TIERS[BUDDY_IDENTITY_TIERS.length - 1];

  return {
    title: locale === "zh" ? matchedTier.zh : matchedTier.en,
    minLevel: matchedTier.minLevel,
    maxLevel: matchedTier.maxLevel,
  };
}

function getNextBuddyIdentity(level: number, locale: Locale) {
  const nextTier = BUDDY_IDENTITY_TIERS.find((tier) => tier.minLevel > level);
  if (!nextTier) return null;

  return {
    title: locale === "zh" ? nextTier.zh : nextTier.en,
    unlockLevel: nextTier.minLevel,
  };
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

function getGoalVariant(goal: ScheduleGoal): BuddyVariant {
  if (goal === "research") return "bunny";
  if (goal === "seminar") return "cat";
  return "bear";
}

function getBuddyFocusFromVariant(variant: BuddyVariant) {
  if (variant === "bunny") return "research" as const;
  if (variant === "cat") return "seminar" as const;
  return "coursework" as const;
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

const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LAST_SEEN_BUDDY_LEVEL_KEY = "english-learn:buddy:last-seen-level";
type WardrobeCategory = "hat" | "clothing" | "glasses" | "heldItem";
type WardrobeTab = WardrobeCategory | "variant";
type InstitutionQuickLink = {
  label: string;
  note: string;
  href: string;
  Icon: LucideIcon;
};
type InstitutionShowcaseCard = {
  key: string;
  eyebrow: string;
  title: string;
  note: string;
  cta: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  Icon: LucideIcon;
};

function getInstitutionSignals(locale: Locale) {
  if (locale === "zh") {
    return ["中南大学 × 邓迪大学", "全英文课程支持", "双校图书馆资源", "潇湘校区校园生活"];
  }

  return ["CSU × Dundee", "EMI coursework support", "Dual-library access", "Xiaoxiang Campus life"];
}

function getInstitutionQuickLinks(locale: Locale): InstitutionQuickLink[] {
  const homeHref = locale === "zh" ? "https://dii.csu.edu.cn/" : "https://dii.csu.edu.cn/EN/HOME.htm";

  return [
    {
      label: locale === "zh" ? "中南大学图书馆" : "CSU Library",
      note: locale === "zh" ? "校内检索、数据库与学习资源" : "Search, databases, and campus study resources",
      href: "https://lib.csu.edu.cn",
      Icon: Library,
    },
    {
      label: locale === "zh" ? "邓迪大学图书馆" : "UoD Library",
      note: locale === "zh" ? "邓迪大学学术资源入口" : "University of Dundee academic resources",
      href: "https://www.dundee.ac.uk/library/",
      Icon: LibraryBig,
    },
    {
      label: locale === "zh" ? "学院邮箱" : "Office Email",
      note: "office_dii@csu.edu.cn",
      href: "mailto:office_dii@csu.edu.cn",
      Icon: Mail,
    },
    {
      label: locale === "zh" ? "学院官网" : "Official Site",
      note: locale === "zh" ? "潇湘校区 · 长沙" : "Xiaoxiang Campus, Changsha",
      href: homeHref,
      Icon: MapPin,
    },
  ];
}

function getInstitutionShowcaseCards(locale: Locale): InstitutionShowcaseCard[] {
  return [
    {
      key: "about-us",
      eyebrow: "About Us",
      title: locale === "zh" ? "学院介绍" : "About DIICSU",
      note:
        locale === "zh"
          ? "了解双校联合办学背景、学院定位与国际化培养框架。"
          : "See the dual-campus background, institute identity, and international learning structure.",
      cta: locale === "zh" ? "查看官方介绍" : "Open official page",
      href:
        locale === "zh"
          ? "https://dii.csu.edu.cn/xygk/xyjs1/xyjj.htm"
          : "https://dii.csu.edu.cn/EN/ABOUT/Why_DIICSU/Introduction.htm",
      imageSrc: "/dii-brand/about-us.jpg",
      imageAlt: locale === "zh" ? "邓迪国际学院学院介绍栏目图" : "DIICSU About Us artwork",
      Icon: Building2,
    },
    {
      key: "degree-programmes",
      eyebrow: "Degree Programmes",
      title: locale === "zh" ? "专业设置" : "Degree Programmes",
      note:
        locale === "zh"
          ? "把专业背景、课程语境和学术英语路径连到一起。"
          : "Connect majors, coursework context, and academic English preparation in one place.",
      cta: locale === "zh" ? "查看专业页面" : "View programmes",
      href:
        locale === "zh"
          ? "https://dii.csu.edu.cn/zsxx/zsxx/zysz.htm"
          : "https://dii.csu.edu.cn/EN/ACADEMICS/DegreeProgrammes.htm",
      imageSrc: "/dii-brand/degree-programmes.jpg",
      imageAlt: locale === "zh" ? "邓迪国际学院专业设置栏目图" : "DIICSU degree programmes artwork",
      Icon: GraduationCap,
    },
    {
      key: "campus-life",
      eyebrow: "Campus Life",
      title: locale === "zh" ? "校园生活" : "Campus Life",
      note:
        locale === "zh"
          ? "把校园活动、成长体验与学习支持一起带进首页。"
          : "Bring campus activities, student life, and institute atmosphere into the home view.",
      cta: locale === "zh" ? "打开校园生活" : "Explore campus life",
      href:
        locale === "zh"
          ? "https://dii.csu.edu.cn/xsgz/xgdt.htm"
          : "https://dii.csu.edu.cn/EN/CAMPUS_LIFE/Campus_Life.htm",
      imageSrc: "/dii-brand/campus-life.jpg",
      imageAlt: locale === "zh" ? "邓迪国际学院校园生活栏目图" : "DIICSU campus life artwork",
      Icon: Compass,
    },
  ];
}

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
    sunhat: { zh: "\u8fce\u65b0\u906e\u9633\u5e3d", en: "Welcome Visor" },
    strawhat: { zh: "\u5b66\u9662\u5fbd\u5e26\u5e3d", en: "Crest Ribbon Hat" },
    cap: { zh: "DIICSU \u68d2\u7403\u5e3d", en: "DIICSU Ball Cap" },
    magichat: { zh: "\u5b66\u672f\u65b9\u5e3d", en: "Academic Mortarboard" },
    chefhat: { zh: "\u5b9e\u9a8c\u8f6f\u5e3d", en: "Lab Cap" },
    catears: { zh: "\u5b66\u9662\u53d1\u7b8d", en: "Spirit Headband" },
    beret: { zh: "\u7814\u8ba8\u8d1d\u96f7\u5e3d", en: "Seminar Beret" },
  } satisfies Record<BuddyHat, { zh: string; en: string }>,
  clothing: {
    none: { zh: "\u9ed8\u8ba4", en: "Default" },
    shorts: { zh: "\u6821\u56ed\u8fd0\u52a8\u77ed\u88e4", en: "Campus Track Shorts" },
    jeans: { zh: "\u5de5\u574a\u957f\u88e4", en: "Workshop Trousers" },
    bloomers: { zh: "\u7814\u7a76\u9614\u88e4", en: "Research Culottes" },
    jk: { zh: "\u5b66\u9662\u897f\u88c5\u88d9", en: "DIICSU Blazer Skirt" },
    pleated: { zh: "\u7814\u8ba8\u767e\u8936\u88d9", en: "Seminar Pleats" },
    petal: { zh: "\u6bd5\u4e1a\u793c\u888d", en: "Graduation Robe" },
  } satisfies Record<BuddyClothing, { zh: string; en: string }>,
  glasses: {
    none: { zh: "\u4e0d\u6234", en: "None" },
    star: { zh: "\u8363\u8a89\u661f\u6846", en: "Honor Star Frames" },
    heart: { zh: "\u5b66\u4f34\u793e\u56e2\u6846", en: "Buddy Club Frames" },
    square: { zh: "\u5bfc\u5e08\u65b9\u6846", en: "Tutor Square Frames" },
    sunglasses: { zh: "\u6821\u56ed\u906e\u5149\u955c", en: "Campus Shades" },
    round: { zh: "\u56fe\u4e66\u9986\u5706\u6846", en: "Library Round Frames" },
    goggles: { zh: "\u5b9e\u9a8c\u62a4\u76ee\u955c", en: "Lab Goggles" },
  } satisfies Record<BuddyGlasses, { zh: string; en: string }>,
  heldItems: {
    none: { zh: "\u7a7a\u624b", en: "Empty Hands" },
    flower: { zh: "\u5b66\u9662\u7ef6\u5e26\u82b1", en: "Crest Rosette" },
    tea: { zh: "\u5b66\u4e60\u4fdd\u6e29\u676f", en: "Study Tumbler" },
    starwand: { zh: "\u5c55\u793a\u6307\u6325\u68d2", en: "Presentation Pointer" },
    notebook: { zh: "\u8bfe\u7a0b\u624b\u518c", en: "Course Handbook" },
    paintbrush: { zh: "\u767d\u677f\u7b14", en: "Whiteboard Marker" },
    moonwand: { zh: "\u8363\u8a89\u793c\u6756", en: "Honor Baton" },
  } satisfies Record<BuddyHeldItem, { zh: string; en: string }>,
};

const buddyVariantCopy: Record<BuddyVariant, { zh: string; en: string; noteZh: string; noteEn: string }> = {
  classic: {
    zh: "经典款",
    en: "Classic",
    noteZh: "默认造型",
    noteEn: "Classic style",
  },
  bear: {
    zh: "指南熊",
    en: "Compass Bear",
    noteZh: "任务导向",
    noteEn: "Quest focus",
  },
  bunny: {
    zh: "云朵兔",
    en: "Cloud Bun",
    noteZh: "研究导向",
    noteEn: "Research focus",
  },
  cat: {
    zh: "星闪猫",
    en: "Spark Cat",
    noteZh: "表达导向",
    noteEn: "Speaking focus",
  },
};

const selectableBuddyVariants: BuddyVariant[] = ["bear", "bunny", "cat"];
const HOME_BUDDY_SPEECH_MOTIONS = ["hop", "wave", "shimmy"] as const;
type HomeBuddySpeechMotion = (typeof HOME_BUDDY_SPEECH_MOTIONS)[number];
type HomeBuddyIntroPhase = "hidden" | "welcome" | "shrinking" | "done";
type HomeBuddyWelcomeCopy = {
  headline: string;
  detail: string;
};

function getHomeBuddyIdleLines(variant: BuddyVariant, locale: Locale) {
  const copy = {
    classic: {
      zh: [
        "今天先从一个小任务开局，我会陪你把节奏带起来。",
        "别担心页面多，我们一项一项来，稳稳推进就好。",
        "我已经把状态调到待命模式了，点一个入口我们就出发。",
        "你负责开始，我负责在旁边盯住今天的学习气氛。",
      ],
      en: [
        "Let's open with one small quest and build momentum from there.",
        "No rush. We can move through the pages one clear step at a time.",
        "I'm already on standby, so pick a route and I'll keep the energy up.",
        "You start the session and I'll keep watch over today's study rhythm.",
      ],
    },
    bear: {
      zh: [
        "任务板我已经看过啦，先拿下最关键的那一项。",
        "今天适合稳扎稳打，我会盯着你的主线任务进度。",
        "如果你想冲效率，就从首页直接发车，我们别空转。",
        "我这种指南熊最擅长的，就是把大目标拆成能完成的小步。",
      ],
      en: [
        "I've checked the mission board. Let's knock out the most important one first.",
        "Today feels like a steady-progress day, and I'll track the main quest with you.",
        "If we want real momentum, let's launch straight from home instead of hovering.",
        "Compass Bears are great at breaking big goals into steps you can actually finish.",
      ],
    },
    bunny: {
      zh: [
        "我闻到一点研究气息了，今天适合多挖几个细节。",
        "先别急着冲数量，跟我一起把一项内容学得更透一点。",
        "如果你点进阅读或听力，我会默认这是一次探索任务。",
        "云朵兔已经把好奇心充满电了，今天想发现点什么？",
      ],
      en: [
        "I can already sense a research mood today. Let's dig into the details.",
        "No need to rush volume. We can make one task feel deeper and smarter.",
        "If you open reading or listening, I'm treating it like an exploration run.",
        "Cloud Bun curiosity is fully charged. What are we discovering today?",
      ],
    },
    cat: {
      zh: [
        "今天的主页灯光不错，很适合练表达和把想法说出来。",
        "如果你准备开口，我会先替你把气氛撑起来。",
        "星闪猫建议你别只看不动，点进去说一句、写一句都算开场。",
        "我已经朝着下一个互动点看过去了，我们去把存在感拉满吧。",
      ],
      en: [
        "The home stage feels good today. Perfect for speaking up and expressing ideas.",
        "If you're ready to talk, I'll help carry the atmosphere for the first step.",
        "Spark Cats don't just watch. One sentence spoken or written is already a strong opening.",
        "I'm already looking toward the next interaction point. Let's make our presence felt.",
      ],
    },
  } satisfies Record<BuddyVariant, { zh: string[]; en: string[] }>;

  return copy[variant][locale];
}

function getHomeBuddyWelcomeCopy(variant: BuddyVariant, locale: Locale, displayName: string): HomeBuddyWelcomeCopy {
  const shortName = displayName.trim() || (locale === "zh" ? "同学" : "friend");
  const copy = {
    classic:
      locale === "zh"
        ? {
            headline: `欢迎光临，${shortName}。这里是邓迪国际学院 DIICSU 的英语冒险校园。`,
            detail: "今天先让我替你把迎新气氛点亮：听力、表达、任务板和学伴成长，都已经准备好开场了。",
          }
        : {
            headline: `Welcome in, ${shortName}. This is the English adventure campus of Dundee International Institute, DIICSU.`,
            detail: "Let me light up the welcome vibe first: listening, expression, mission boards, and buddy growth are all ready to open the day.",
          },
    bear:
      locale === "zh"
        ? {
            headline: `欢迎光临，${shortName}。这里是邓迪国际学院 DIICSU，指南熊先替你把主线任务排好。`,
            detail: "今天从首页出发，我们会像真正的新生导览一样，稳稳走过任务台、学习楼和成长看板。",
          }
        : {
            headline: `Welcome in, ${shortName}. You are at DIICSU, and your Compass Bear has already lined up the main route.`,
            detail: "Starting from home, we'll move like a real freshman campus tour through missions, study halls, and growth boards.",
          },
    bunny:
      locale === "zh"
        ? {
            headline: `欢迎光临，${shortName}。邓迪国际学院 DIICSU 的探索信号已经亮起，云朵兔先来迎接你。`,
            detail: "今天我们不只做题，还会在这个校园里找资料、听讲座、读内容，把好奇心也一起带进学习节奏。",
          }
        : {
            headline: `Welcome in, ${shortName}. The DIICSU exploration signal is live, and Cloud Bun is here to greet you first.`,
            detail: "Today we are not just answering tasks - we are exploring lectures, reading trails, and research curiosity across campus.",
          },
    cat:
      locale === "zh"
        ? {
            headline: `欢迎光临，${shortName}。这里是邓迪国际学院 DIICSU，星闪猫先替你把舞台灯光打开。`,
            detail: "欢迎来到更会表达的校园首页：等会儿我们要去开口、去互动、去把今天的存在感和学习状态一起拉满。",
          }
        : {
            headline: `Welcome in, ${shortName}. This is DIICSU, and Spark Cat has already switched on the stage lights for you.`,
            detail: "Welcome to a more expressive campus home: next we'll speak up, interact, and turn today's presence into momentum.",
          },
  } satisfies Record<BuddyVariant, HomeBuddyWelcomeCopy>;

  return copy[variant];
}

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
  const [buddyVariant, setBuddyVariant] = useState<BuddyVariant>(DEFAULT_BUDDY_VARIANT);
  const [xpSummary, setXpSummary] = useState(() => createEmptyBuddyXpSummary());
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [wardrobeTab, setWardrobeTab] = useState<WardrobeTab>("hat");
  const [wardrobeFlipTick, setWardrobeFlipTick] = useState(0);
  const [showLevelRules, setShowLevelRules] = useState(false);
  const [levelUpNotice, setLevelUpNotice] = useState<{ level: number; stageTitle: string } | null>(null);
  const levelUpNoticeTimerRef = useRef<number | null>(null);
  const [homeBuddyFace, setHomeBuddyFace] = useState<BuddyFace>("happy");
  const [homeBuddyLineIndex, setHomeBuddyLineIndex] = useState(0);
  const [homeBuddySpeechTick, setHomeBuddySpeechTick] = useState(0);
  const [homeBuddySpeechMotion, setHomeBuddySpeechMotion] = useState<HomeBuddySpeechMotion>("hop");
  const [homeBuddyBubbleVisible, setHomeBuddyBubbleVisible] = useState(true);
  const [homeBuddyTilt, setHomeBuddyTilt] = useState({ x: 0, y: 0 });
  const [homeHasHydrated, setHomeHasHydrated] = useState(false);
  const [homeBuddyIntroPhase, setHomeBuddyIntroPhase] = useState<HomeBuddyIntroPhase>("hidden");
  const [homeBuddyIntroTarget, setHomeBuddyIntroTarget] = useState<{ x: number; y: number; scale: number } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [homeBuddyAudioReady, setHomeBuddyAudioReady] = useState(false);
  const guestBuddyAnchorRef = useRef<HTMLDivElement | null>(null);
  const mainBuddyAnchorRef = useRef<HTMLDivElement | null>(null);
  const homeBuddyIntroShrinkTimerRef = useRef<number | null>(null);
  const homeBuddyIntroFinishTimerRef = useRef<number | null>(null);
  const accountLabel = locale === "zh" ? "个人主页" : "Profile";
  const loginLabel = locale === "zh" ? "登录" : "Log in";
  const logoutLabel = locale === "zh" ? "退出" : "Log out";

  useEffect(() => {
    const refresh = () => {
      const storedPreferences = loadSchedulePreferencesFromStorage(locale);
      setIsLoggedIn(window.localStorage.getItem("demo_logged_in") === "true");
      setDisplayName(toDisplayName(window.localStorage.getItem("demo_user")));
      setLevelPrefix(normalizeLevel(window.localStorage.getItem("demo_level")));
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
      setPreferences(storedPreferences);
      setBuddyOutfit(loadBuddyOutfitFromStorage());
      setBuddyVariant(loadBuddyVariantFromStorage(getGoalVariant(storedPreferences.goal)));
      setXpSummary(getBuddyXpSummaryFromStorage());
      setHomeHasHydrated(true);
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

  useEffect(() => {
    if (isLoggedIn) return;

    let cancelled = false;

    const syncSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          authenticated?: boolean;
          user?: { username?: string; email?: string } | null;
          auth_provider?: string;
          auth_user_id?: string;
        };

        if (!payload.authenticated || cancelled) return;

        localStorage.setItem("demo_logged_in", "true");
        localStorage.setItem(
          "demo_user",
          payload.user?.username || payload.user?.email || "Learner",
        );
        if (payload.auth_user_id) {
          localStorage.setItem("demo_auth_user_id", payload.auth_user_id);
        }
        if (payload.auth_provider) {
          localStorage.setItem("demo_auth_provider", payload.auth_provider);
        }
        window.dispatchEvent(new Event("demo-auth-changed"));
      } catch {
        // Ignore silent session sync failures on the home hero.
      }
    };

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

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
  const buddyIdentity = getBuddyIdentity(buddyLevel, locale);
  const nextBuddyIdentity = getNextBuddyIdentity(buddyLevel, locale);
  const buddyFocus = getBuddyFocusFromVariant(buddyVariant);
  const homeBuddyIdleLines = useMemo(() => getHomeBuddyIdleLines(buddyVariant, locale), [buddyVariant, locale]);
  const homeBuddyWelcomeCopy = useMemo(
    () => getHomeBuddyWelcomeCopy(buddyVariant, locale, displayName),
    [buddyVariant, displayName, locale],
  );
  const activeHomeBuddyLine = homeBuddyIdleLines[homeBuddyLineIndex % homeBuddyIdleLines.length] ?? buddyStage.note;
  const homeBuddyLoadingActive = !homeHasHydrated;
  const homeBuddyIntroActive = homeBuddyIntroPhase !== "hidden" && homeBuddyIntroPhase !== "done";
  const homeBuddyTiltStyle = {
    "--home-buddy-tilt-x": `${homeBuddyTilt.x.toFixed(2)}deg`,
    "--home-buddy-tilt-y": `${homeBuddyTilt.y.toFixed(2)}deg`,
  } as CSSProperties;
  const homeBuddyIntroStyle = {
    "--home-buddy-intro-x": `${homeBuddyIntroTarget?.x ?? 0}px`,
    "--home-buddy-intro-y": `${homeBuddyIntroTarget?.y ?? 0}px`,
    "--home-buddy-intro-scale": String(homeBuddyIntroTarget?.scale ?? 1),
  } as CSSProperties;
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

  const clearHomeBuddyIntroTimers = useCallback(() => {
    if (homeBuddyIntroShrinkTimerRef.current !== null) {
      window.clearTimeout(homeBuddyIntroShrinkTimerRef.current);
      homeBuddyIntroShrinkTimerRef.current = null;
    }
    if (homeBuddyIntroFinishTimerRef.current !== null) {
      window.clearTimeout(homeBuddyIntroFinishTimerRef.current);
      homeBuddyIntroFinishTimerRef.current = null;
    }
  }, []);

  const syncHomeBuddyIntroTarget = useCallback(() => {
    if (typeof window === "undefined") return;
    const activeAnchor = isLoggedIn ? mainBuddyAnchorRef.current : guestBuddyAnchorRef.current;
    if (!activeAnchor) return;

    const rect = activeAnchor.getBoundingClientRect();
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;
    const introBaseWidth = 336;

    setHomeBuddyIntroTarget({
      x: targetCenterX - viewportCenterX,
      y: targetCenterY - viewportCenterY,
      scale: Math.max(0.42, Math.min(0.88, rect.width / introBaseWidth)),
    });
  }, [isLoggedIn]);

  const ensureHomeBuddyAudio = () => {
    if (typeof window === "undefined") return null;
    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor();
    }
    const context = audioContextRef.current;
    if (context.state === "suspended") {
      void context.resume();
    }
    return context;
  };

  const playHomeBuddyVoice = useCallback((variant: BuddyVariant) => {
    const context = ensureHomeBuddyAudio();
    if (!context || !homeBuddyAudioReady) return;

    const now = context.currentTime;
    const voiceProfiles: Record<BuddyVariant, { root: number; accent: number; type: OscillatorType; gain: number }> = {
      classic: { root: 610, accent: 760, type: "sine", gain: 0.02 },
      bear: { root: 460, accent: 560, type: "triangle", gain: 0.026 },
      bunny: { root: 720, accent: 910, type: "sine", gain: 0.018 },
      cat: { root: 660, accent: 980, type: "square", gain: 0.015 },
    };

    const profile = voiceProfiles[variant];
    const notes = [
      profile.root,
      profile.accent,
      profile.root * 1.08,
    ];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = profile.type;
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.065);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.96, now + index * 0.065 + 0.09);
      gainNode.gain.setValueAtTime(0.0001, now + index * 0.065);
      gainNode.gain.exponentialRampToValueAtTime(profile.gain, now + index * 0.065 + 0.018);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.065 + 0.11);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(now + index * 0.065);
      oscillator.stop(now + index * 0.065 + 0.12);
    });
  }, [homeBuddyAudioReady]);

  const finishHomeBuddyIntro = () => {
    clearHomeBuddyIntroTimers();

    if (homeBuddyIntroPhase === "done" || homeBuddyIntroPhase === "hidden") return;

    if (homeBuddyIntroPhase !== "shrinking") {
      syncHomeBuddyIntroTarget();
      setHomeBuddyIntroPhase("shrinking");
      setHomeBuddyBubbleVisible(false);
      setHomeBuddyFace("happy");
    }

    homeBuddyIntroFinishTimerRef.current = window.setTimeout(() => {
      setHomeBuddyIntroPhase("done");
      setHomeBuddyBubbleVisible(true);
      homeBuddyIntroFinishTimerRef.current = null;
    }, 1220);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHomeBuddyLineIndex(0);
      setHomeBuddyBubbleVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [homeBuddyIdleLines]);

  useEffect(() => {
    if (!homeHasHydrated) return;

    const frame = window.requestAnimationFrame(() => {
      setHomeBuddyIntroPhase("welcome");
      setHomeBuddyBubbleVisible(false);
      setHomeBuddyFace("open");
      setHomeBuddySpeechMotion("wave");
    });

    return () => {
      window.cancelAnimationFrame(frame);
      clearHomeBuddyIntroTimers();
    };
  }, [clearHomeBuddyIntroTimers, homeHasHydrated]);

  useEffect(() => {
    if (!homeBuddyIntroActive) return;

    syncHomeBuddyIntroTarget();
    const handleResize = () => syncHomeBuddyIntroTarget();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [homeBuddyIntroActive, syncHomeBuddyIntroTarget]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const activateAudio = () => {
      const context = ensureHomeBuddyAudio();
      if (!context) return;
      setHomeBuddyAudioReady(true);
      window.removeEventListener("pointerdown", activateAudio);
      window.removeEventListener("keydown", activateAudio);
    };

    window.addEventListener("pointerdown", activateAudio, { passive: true });
    window.addEventListener("keydown", activateAudio);

    return () => {
      window.removeEventListener("pointerdown", activateAudio);
      window.removeEventListener("keydown", activateAudio);
    };
  }, []);

  useEffect(() => {
    if (!homeBuddyIntroActive) return;

    const frame = window.requestAnimationFrame(() => {
      setHomeBuddySpeechTick((current) => current + 1);
      playHomeBuddyVoice(buddyVariant);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [buddyVariant, homeBuddyAudioReady, homeBuddyIntroActive]);

  useEffect(() => {
    if (typeof window === "undefined" || homeBuddyIntroActive) return;

    let blinkTimer = 0;
    let reopenTimer = 0;
    let secondBlinkTimer = 0;

    const queueBlink = () => {
      const delay = 2600 + Math.random() * 2200;
      blinkTimer = window.setTimeout(() => {
        setHomeBuddyFace("blink");
        reopenTimer = window.setTimeout(() => {
          setHomeBuddyFace("happy");
          if (Math.random() > 0.72) {
            secondBlinkTimer = window.setTimeout(() => {
              setHomeBuddyFace("blink");
              reopenTimer = window.setTimeout(() => {
                setHomeBuddyFace("happy");
                queueBlink();
              }, 140);
            }, 120);
            return;
          }
          queueBlink();
        }, 150);
      }, delay);
    };

    queueBlink();

    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(reopenTimer);
      window.clearTimeout(secondBlinkTimer);
    };
  }, [homeBuddyIntroActive]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let hideTimer = 0;
    let nextLineTimer = 0;
    let frame = 0;

    const showDuration = 6400;
    const quietDuration = 3400;

    const queueCycle = () => {
      hideTimer = window.setTimeout(() => {
        setHomeBuddyBubbleVisible(false);
        if (homeBuddyIdleLines.length <= 1) return;

        nextLineTimer = window.setTimeout(() => {
          setHomeBuddyLineIndex((current) => (current + 1) % homeBuddyIdleLines.length);
          setHomeBuddyBubbleVisible(true);
          queueCycle();
        }, quietDuration);
      }, showDuration);
    };

    frame = window.requestAnimationFrame(() => {
      setHomeBuddyBubbleVisible(true);
      queueCycle();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer);
      window.clearTimeout(nextLineTimer);
    };
  }, [homeBuddyIdleLines]);

  useEffect(() => {
    if (typeof window === "undefined" || homeBuddyIntroActive || !homeBuddyBubbleVisible) return;

    let settleTimer = 0;
    const frame = window.requestAnimationFrame(() => {
      setHomeBuddySpeechTick((current) => current + 1);
      setHomeBuddyFace("open");
      setHomeBuddySpeechMotion(HOME_BUDDY_SPEECH_MOTIONS[homeBuddyLineIndex % HOME_BUDDY_SPEECH_MOTIONS.length]);
      playHomeBuddyVoice(buddyVariant);

      settleTimer = window.setTimeout(() => {
        setHomeBuddyFace("happy");
      }, 820);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, [buddyVariant, homeBuddyAudioReady, homeBuddyBubbleVisible, homeBuddyIntroActive, homeBuddyLineIndex]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const handleHomeBuddyPointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
    const clampedX = Math.max(-1, Math.min(1, relativeX * 2));
    const clampedY = Math.max(-1, Math.min(1, relativeY * 2));
    setHomeBuddyTilt({
      x: clampedX * 10,
      y: clampedY * -8,
    });
  };

  const resetHomeBuddyTilt = () => {
    setHomeBuddyTilt({ x: 0, y: 0 });
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

  const updateBuddyVariant = (variant: BuddyVariant) => {
    const updated = saveBuddyVariantToStorage(variant);
    setBuddyVariant(updated);
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

  const handleWardrobeTabChange = (tab: WardrobeTab) => {
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
  const identityRuleRows = BUDDY_IDENTITY_TIERS.map((tier) => ({
    key: `${tier.minLevel}-${tier.maxLevel}`,
    levelLabel:
      tier.maxLevel === Number.POSITIVE_INFINITY
        ? `Lv ${tier.minLevel}`
        : `Lv ${tier.minLevel}-${tier.maxLevel}`,
    title: locale === "zh" ? tier.zh : tier.en,
  }));
  const xpSourceRows = [
    locale === "zh" ? `Listening 完成 +${BUDDY_XP_RULES.listeningCompletion} XP` : `Listening completion +${BUDDY_XP_RULES.listeningCompletion} XP`,
    locale === "zh" ? `Speaking 完成 +${BUDDY_XP_RULES.speakingCompletion} XP` : `Speaking completion +${BUDDY_XP_RULES.speakingCompletion} XP`,
    locale === "zh" ? `Reading 完成 +${BUDDY_XP_RULES.readingCompletion} XP` : `Reading completion +${BUDDY_XP_RULES.readingCompletion} XP`,
    locale === "zh" ? `Writing 完成 +${BUDDY_XP_RULES.writingCompletion} XP` : `Writing completion +${BUDDY_XP_RULES.writingCompletion} XP`,
    locale === "zh" ? `Review 完成 +${BUDDY_XP_RULES.reviewSession} XP` : `Review completion +${BUDDY_XP_RULES.reviewSession} XP`,
    locale === "zh" ? `Word Game 通关 +${BUDDY_XP_RULES.wordGameClear} XP` : `Word game clear +${BUDDY_XP_RULES.wordGameClear} XP`,
    locale === "zh" ? `Quest Arcade 通关 +${BUDDY_XP_RULES.escapeRoomClear} XP` : `Quest Arcade clear +${BUDDY_XP_RULES.escapeRoomClear} XP`,
    locale === "zh" ? `Dorm Lockout 通关 +${BUDDY_XP_RULES.dormLockoutClear} XP` : `Dorm Lockout clear +${BUDDY_XP_RULES.dormLockoutClear} XP`,
    locale === "zh" ? `Last Train Escape 通关 +${BUDDY_XP_RULES.lastTrainClear} XP` : `Last Train Escape clear +${BUDDY_XP_RULES.lastTrainClear} XP`,
  ];
  const institutionSignals = getInstitutionSignals(locale);
  const institutionQuickLinks = getInstitutionQuickLinks(locale);
  const institutionShowcaseCards = getInstitutionShowcaseCards(locale);
  const institutionResourcePanel = (
    <div className="diicsu-resource-panel mt-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-label diicsu-section-label">
            <Building2 className="size-3.5" />
            {locale === "zh" ? "邓迪国际学院官方入口" : "DIICSU Official Touchpoints"}
          </p>
          <h3 className="font-display mt-4 text-2xl tracking-tight text-[var(--ink)] sm:text-[2rem]">
            {locale === "zh" ? "把学院资源和学习主界面放在一起。" : "Keep institute resources and study routes in one place."}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            {locale === "zh"
              ? "围绕双校联合背景、全英文课程、图书馆资源和校园生活，把更像邓迪国际学院的入口带回首页。"
              : "Bring dual-campus context, library resources, and campus-life cues into the same hub as listening, speaking, reading, and writing."}
          </p>
        </div>
      </div>

      <div className="diicsu-resource-grid mt-5">
        {institutionQuickLinks.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="diicsu-resource-link"
          >
            <span className="quest-orb h-11 w-11 shrink-0">
              <item.Icon className="size-4.5 text-[var(--navy)]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--ink)]">{item.label}</span>
              <span className="diicsu-resource-link-note">{item.note}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-[var(--navy)]" />
          </a>
        ))}
      </div>
    </div>
  );
  const institutionQuickLinkStrip = (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {institutionQuickLinks.map((item) => (
        <a
          key={`hero-${item.label}`}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="diicsu-resource-link"
        >
          <span className="quest-orb h-11 w-11 shrink-0">
            <item.Icon className="size-4.5 text-[var(--navy)]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--ink)]">{item.label}</span>
            <span className="diicsu-resource-link-note">{item.note}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-[var(--navy)]" />
        </a>
      ))}
    </div>
  );
  const institutionShowcaseGrid = (
    <div className="grid gap-4 lg:grid-cols-3">
      {institutionShowcaseCards.map((item) => (
        <article key={item.key} className="campus-card diicsu-campus-card p-4">
          <div className="diicsu-campus-media">
            <Image
              src={item.imageSrc}
              alt={item.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="diicsu-campus-media-overlay" />
            <p className="section-label diicsu-campus-media-label">
              <item.Icon className="size-3.5" />
              {item.eyebrow}
            </p>
          </div>

          <div className="diicsu-campus-card-body">
            <h3 className="text-xl font-semibold text-[var(--ink)]">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{item.note}</p>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="pet-sticker diicsu-campus-link mt-5"
            >
              {item.cta}
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
      });
    } catch {
      // Ignore sign-out network errors and still clear local client state.
    }

    localStorage.removeItem("demo_logged_in");
    localStorage.removeItem("demo_user");
    localStorage.removeItem("demo_auth_provider");
    localStorage.removeItem("demo_auth_user_id");
    window.dispatchEvent(new Event("demo-auth-changed"));
    window.location.href = "/";
  };

  const homeHeroTopBar = (
    <div className="relative z-10 mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <InstitutionBrand locale={locale} embedded compact className="max-w-[17rem] justify-start lg:flex-none" />
        <span className="buddy-chip buddy-chip-brand whitespace-nowrap">
          <Building2 className="size-4" />
          {locale === "zh" ? "中南大学 × 邓迪大学" : "Central South University × Dundee"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
        <LanguageSwitcher locale={locale} />
        {isLoggedIn ? (
          <>
            <Link href={`/dashboard?lang=${locale}`} className="party-button-ghost whitespace-nowrap">
              <User className="size-4" />
              {accountLabel}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--diicsu-maroon),#b84b6b)] px-4 text-[15px] font-semibold text-white shadow-[0_9px_0_rgba(107,18,49,0.24),0_18px_26px_rgba(146,16,65,0.18)] transition hover:translate-y-[-1px]"
            >
              <LogOut className="size-4" />
              {logoutLabel}
            </button>
          </>
        ) : (
          <Link href={`/login?lang=${locale}`} className="party-button whitespace-nowrap">
            <LogIn className="size-4" />
            {loginLabel}
          </Link>
        )}
      </div>
    </div>
  );

  const homeBuddyLoadingOverlay = homeBuddyLoadingActive ? (
    <div className="home-buddy-loading-overlay" aria-live="polite" aria-label={locale === "zh" ? "首页桌宠加载中" : "Homepage buddy loading"}>
      <div className="home-buddy-loading-card">
        <div className="home-buddy-loading-orbit">
          <span className="home-buddy-loading-dot home-buddy-loading-dot-one" />
          <span className="home-buddy-loading-dot home-buddy-loading-dot-two" />
          <span className="home-buddy-loading-dot home-buddy-loading-dot-three" />
        </div>
        <p className="mt-5 text-sm font-semibold tracking-[0.08em] text-[var(--ink)]">
          {locale === "zh" ? "Buddy 正在换上今天的出场造型..." : "Buddy is putting on today's entrance look..."}
        </p>
      </div>
    </div>
  ) : null;

  const homeBuddyIntroOverlay = homeBuddyIntroActive ? (
    <div
      className="home-buddy-intro-overlay"
      aria-live="polite"
      aria-label={locale === "zh" ? "首页桌宠欢迎动画" : "Homepage buddy welcome animation"}
      onPointerDown={finishHomeBuddyIntro}
    >
      <div
        className={`home-buddy-intro-stage${homeBuddyIntroPhase === "shrinking" ? " home-buddy-intro-stage-shrinking" : ""}`}
        style={homeBuddyIntroStyle}
      >
        <div className="buddy-bubble home-buddy-intro-bubble p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            {locale === "zh" ? "Dundee International Institute · DIICSU" : "Dundee International Institute · DIICSU"}
          </p>
          <p className="mt-3 text-base font-semibold leading-7 text-[var(--ink)] sm:text-lg">{homeBuddyWelcomeCopy.headline}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] sm:text-[0.96rem]">{homeBuddyWelcomeCopy.detail}</p>
        </div>
        <div className="home-buddy-intro-shell">
          <div className="home-buddy-intro-look">
            <div className="home-hero-buddy-idle" data-speech-motion={homeBuddySpeechMotion}>
              <BuddyCompanion
                stage={isLoggedIn ? buddyStage.id : "fresh"}
                focus={buddyFocus}
                variant={buddyVariant}
                mood={isLoggedIn ? buddyStage.mood : "happy"}
                face={homeBuddyFace}
                outfit={effectiveBuddyOutfit}
                className="mx-auto home-buddy-intro-companion"
              />
            </div>
          </div>
        </div>
        <p className="home-buddy-intro-hint">
          {locale === "zh" ? "点击任意区域进入学习" : "Click anywhere to start learning"}
        </p>
      </div>
    </div>
  ) : null;

  if (!isLoggedIn) {
    return (
      <>
        {homeBuddyLoadingOverlay}
        {homeBuddyIntroOverlay}
        <section className={`grid gap-5 reveal-up${homeBuddyLoadingActive ? " home-buddy-page-preload" : ""}${homeBuddyIntroActive ? " home-buddy-page-locked" : ""}`}>
        <article className="sky-panel diicsu-hero-panel rounded-[2.5rem] px-6 pb-7 pt-4 sm:px-8 sm:pb-9 sm:pt-5">
          {homeHeroTopBar}
          <span className="party-floater bottom-[4.5rem] right-[28%] h-10 w-10">
            <Mic className="size-4.5" />
          </span>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 xl:flex-nowrap">
                <span className="buddy-chip buddy-chip-brand">
                  <Building2 className="size-4" />
                  {locale === "zh" ? "中南大学 × 邓迪大学" : "Central South University × Dundee"}
                </span>
                <span className="buddy-chip">
                  <Sparkles className="size-4 text-[var(--navy)]" />
                  {locale === "zh" ? "邓迪国际学院学术英语平台" : "DIICSU Academic English Hub"}
                </span>
              </div>

              <h2 className="font-display game-title mt-3 max-w-3xl text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
                {locale === "zh"
                  ? "面向邓迪国际学院学生的学术英语主界面。"
                  : "An academic English home built for DIICSU students."}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
                {locale === "zh"
                  ? "围绕全英文课程、seminar 发言、reading list、专业学习和双校资源入口设计，让首页既保留学伴体验，也更像邓迪国际学院自己的平台。"
                  : "Built around EMI coursework, seminar turns, reading lists, majors, and dual-campus resources, so the home view feels closer to a DIICSU platform while keeping the buddy experience."}
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
              {institutionResourcePanel}

              <div className="mt-6 flex flex-wrap gap-2.5">
                {institutionSignals.map((item) => (
                  <span key={item} className="pet-sticker">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="relative mx-auto max-w-[24rem] overflow-visible rounded-[2.2rem] border-2 border-white/90 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_16px_0_rgba(255,201,225,0.26),0_28px_56px_rgba(90,123,255,0.14)] backdrop-blur-xl">
                <div
                  key={`home-buddy-bubble-guest-${homeBuddySpeechTick}`}
                  className={`buddy-bubble home-hero-buddy-bubble p-4${homeBuddyBubbleVisible ? " home-hero-buddy-bubble-visible" : " home-hero-buddy-bubble-hidden"}`}
                  aria-hidden={!homeBuddyBubbleVisible}
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">{activeHomeBuddyLine}</p>
                </div>
                <div className="party-stage mt-4 px-5 pb-5 pt-3">
                  <div className="pet-spotlight" />
                  <div
                    className="home-hero-buddy-shell"
                    ref={guestBuddyAnchorRef}
                    style={homeBuddyTiltStyle}
                    onPointerMove={handleHomeBuddyPointerMove}
                    onPointerLeave={resetHomeBuddyTilt}
                  >
                    <div className="home-hero-buddy-look">
                      <div
                        key={`home-buddy-motion-guest-${homeBuddySpeechTick}`}
                        className="home-hero-buddy-idle"
                        data-speech-motion={homeBuddySpeechMotion}
                      >
                        <BuddyCompanion
                          stage="fresh"
                          focus={buddyFocus}
                          variant={buddyVariant}
                          mood="happy"
                          face={homeBuddyFace}
                          outfit={buddyOutfit}
                          className="mx-auto home-hero-buddy-companion"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {institutionShowcaseGrid}
        </section>
      </>
    );
  }

  return (
    <>
      {homeBuddyLoadingOverlay}
      {homeBuddyIntroOverlay}
      <section className={`grid gap-5 reveal-up${homeBuddyLoadingActive ? " home-buddy-page-preload" : ""}${homeBuddyIntroActive ? " home-buddy-page-locked" : ""}`}>
      <article className="sky-panel diicsu-hero-panel rounded-[2.5rem] px-6 pb-7 pt-4 sm:px-8 sm:pb-8 sm:pt-5">
        {homeHeroTopBar}
        <span className="party-floater bottom-16 right-[32%] h-10 w-10">
          <Compass className="size-4.5" />
        </span>
        <div className="grid gap-8 xl:min-h-[44rem]">
          <div className="relative z-10 xl:max-w-[52rem]">
            <h2 className="font-display game-title mt-3 max-w-3xl text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
              {locale === "zh"
                ? `你好，${displayName}。从邓迪国际学院的学习主线开始今天。`
                : `Hi, ${displayName}. Start today from the DIICSU study route.`}
            </h2>
          </div>

          <div className="relative z-10 xl:max-w-[26rem]">
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
            <div className="relative max-w-[26rem] overflow-visible rounded-[2.2rem] border-2 border-white/90 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_16px_0_rgba(255,201,225,0.26),0_28px_56px_rgba(90,123,255,0.14)] backdrop-blur-xl">
              <div
                key={`home-buddy-bubble-main-${homeBuddySpeechTick}`}
                className={`buddy-bubble home-hero-buddy-bubble p-4${homeBuddyBubbleVisible ? " home-hero-buddy-bubble-visible" : " home-hero-buddy-bubble-hidden"}`}
                aria-hidden={!homeBuddyBubbleVisible}
              >
                <p className="text-sm font-semibold text-[var(--ink)]">{activeHomeBuddyLine}</p>
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
                  onPointerMove={handleHomeBuddyPointerMove}
                  onPointerLeave={resetHomeBuddyTilt}
                  className={`buddy-dressup-trigger mx-auto block rounded-[1.8rem] border-0 bg-transparent p-0${
                    levelUpNotice ? " animate-[globalBuddyBounceHit_1s_ease-in-out_5]" : ""
                  }`}
                  aria-label={locale === "zh" ? "打开桌宠换装" : "Open buddy wardrobe"}
                >
                  <div className="home-hero-buddy-shell" ref={mainBuddyAnchorRef} style={homeBuddyTiltStyle}>
                    <div className="home-hero-buddy-look">
                      <div
                        key={`home-buddy-motion-main-${homeBuddySpeechTick}`}
                        className="home-hero-buddy-idle"
                        data-speech-motion={homeBuddySpeechMotion}
                      >
                        <BuddyCompanion
                          stage={buddyStage.id}
                          focus={buddyFocus}
                          variant={buddyVariant}
                          mood={buddyStage.mood}
                          face={homeBuddyFace}
                          outfit={effectiveBuddyOutfit}
                          className="mx-auto home-hero-buddy-companion"
                        />
                      </div>
                    </div>
                  </div>
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
                  <p className="mt-2 text-xs font-semibold text-[#2a4f90]">{buddyIdentity.title}</p>
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
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--ink-soft)]">
                  <span>
                    {locale === "zh" ? `当前身份：${buddyIdentity.title}` : `Current title: ${buddyIdentity.title}`}
                  </span>
                  <span>
                    {nextBuddyIdentity
                      ? locale === "zh"
                        ? `Lv ${nextBuddyIdentity.unlockLevel} 解锁 ${nextBuddyIdentity.title}`
                        : `Lv ${nextBuddyIdentity.unlockLevel} unlocks ${nextBuddyIdentity.title}`
                      : locale === "zh"
                        ? "已达到最高身份"
                        : "Top title unlocked"}
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

          <div className="relative z-10">
            {institutionQuickLinkStrip}
          </div>
        </div>
      </article>

      {showLevelRules && typeof document !== "undefined"
        ? createPortal(
            <div className="buddy-wardrobe-overlay" role="dialog" aria-modal="true" onClick={() => setShowLevelRules(false)}>
              <div
                className="buddy-wardrobe-panel max-h-[calc(100vh-2.5rem)] overflow-y-auto"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowLevelRules(false)}
                  className="buddy-wardrobe-close"
                  aria-label={locale === "zh" ? "关闭升级规则" : "Close level rules"}
                >
                  ×
                </button>

                <div className="relative z-10 mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(18rem,0.98fr)]">
                  <div className="buddy-wardrobe-page buddy-wardrobe-page-left">
                    <p className="section-label">
                      <PawPrint className="size-3.5" />
                      {locale === "zh" ? "宠物升级规则" : "Buddy level rules"}
                    </p>
                    <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
                      {locale === "zh" ? "查看 Buddy 的升级与身份门槛" : "See buddy growth and identity milestones"}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                      {locale === "zh"
                        ? `第 1 次升级需要 ${LEVEL_XP_BASE} XP，之后每升一级固定多 ${LEVEL_XP_STEP} XP。每 5 级会解锁一个新的身份称号，直到 25 级达到最高门槛。`
                        : `The first level-up needs ${LEVEL_XP_BASE} XP, and each later level needs ${LEVEL_XP_STEP} more XP than the one before. Every 5 levels unlock a new identity title, until the top milestone at level 25.`}
                    </p>

                    <div className="mt-6 grid gap-2.5">
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
                  </div>

                  <div className="buddy-wardrobe-page rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,rgba(247,251,255,0.98),rgba(236,245,255,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_16px_30px_rgba(90,123,255,0.09)]">
                    <div className="rounded-[1.2rem] border-2 border-white/90 bg-[rgba(255,255,255,0.84)] px-4 py-3 shadow-[0_8px_0_rgba(143,196,255,0.12),0_14px_20px_rgba(90,123,255,0.07)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        {locale === "zh" ? "身份门槛" : "Identity milestones"}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--ink)]">
                        {identityRuleRows.map((row) => (
                          <div key={row.key} className="flex items-center justify-between gap-3 rounded-[1rem] bg-white/72 px-3 py-2">
                            <span className="font-semibold text-[var(--ink)]">{row.title}</span>
                            <span className="buddy-chip !px-3 !py-1">{row.levelLabel}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.2rem] border-2 border-white/90 bg-[rgba(255,255,255,0.84)] px-4 py-3 shadow-[0_8px_0_rgba(143,196,255,0.12),0_14px_20px_rgba(90,123,255,0.07)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        {locale === "zh" ? "固定 XP 来源" : "Fixed XP sources"}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-[var(--ink)] sm:grid-cols-2">
                        {xpSourceRows.map((row) => (
                          <p key={row} className="rounded-[0.95rem] bg-white/72 px-3 py-2 font-medium">
                            {row}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

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
                        ["variant", locale === "zh" ? "形象" : "Buddy", PawPrint],
                        ["hat", locale === "zh" ? "帽子" : "Hats", HatGlasses],
                        ["clothing", locale === "zh" ? "服装" : "Bottoms", Shirt],
                        ["glasses", locale === "zh" ? "眼镜" : "Glasses", Glasses],
                        ["heldItem", locale === "zh" ? "手持物" : "Handhelds", Hand],
                      ] as Array<[WardrobeTab, string, typeof PawPrint]>
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
                        ? "可以在这里切换宠物初始形象，也可以自由搭配帽子、服装、眼镜和手持物。"
                        : "Switch your buddy base style here, then mix hats, bottoms, glasses, and handheld props freely."}
                    </p>

                    <div key={`options-${wardrobeTab}-${wardrobeFlipTick}`} className="buddy-wardrobe-options buddy-wardrobe-page-flip mt-6">
                      {wardrobeTab === "variant"
                        ? selectableBuddyVariants.map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => updateBuddyVariant(key)}
                              className={`buddy-wardrobe-option${buddyVariant === key ? " buddy-wardrobe-option-active" : ""}`}
                            >
                              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/90 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.96),rgba(214,240,255,0.78)_58%,rgba(255,230,241,0.72))]">
                                <BuddyCompanion
                                  stage={buddyStage.id}
                                  focus={getBuddyFocusFromVariant(key)}
                                  variant={key}
                                  mood="happy"
                                  outfit={effectiveBuddyOutfit}
                                  float={false}
                                  className="w-[2.15rem] max-w-[2.15rem]"
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block">{buddyVariantCopy[key][locale]}</span>
                                <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                                  {locale === "zh" ? buddyVariantCopy[key].noteZh : buddyVariantCopy[key].noteEn}
                                </span>
                              </span>
                            </button>
                          ))
                        : null}
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
                        focus={buddyFocus}
                        variant={buddyVariant}
                        mood="happy"
                        outfit={effectiveBuddyOutfit}
                        className="mx-auto"
                      />
                    </div>
                    <div className="buddy-bubble mt-4 p-4">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {locale === "zh"
                          ? `当前搭配：${buddyVariantCopy[buddyVariant].zh} / ${buddyWardrobeCopy.hats[effectiveBuddyOutfit.hat].zh} / ${buddyWardrobeCopy.clothing[effectiveBuddyOutfit.clothing].zh} / ${buddyWardrobeCopy.glasses[effectiveBuddyOutfit.glasses].zh} / ${buddyWardrobeCopy.heldItems[effectiveBuddyOutfit.heldItem].zh}`
                          : `Current look: ${buddyVariantCopy[buddyVariant].en} / ${buddyWardrobeCopy.hats[effectiveBuddyOutfit.hat].en} / ${buddyWardrobeCopy.clothing[effectiveBuddyOutfit.clothing].en} / ${buddyWardrobeCopy.glasses[effectiveBuddyOutfit.glasses].en} / ${buddyWardrobeCopy.heldItems[effectiveBuddyOutfit.heldItem].en}`}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBuddyOutfit(saveBuddyOutfitToStorage(DEFAULT_BUDDY_OUTFIT));
                          setBuddyVariant(saveBuddyVariantToStorage(DEFAULT_BUDDY_VARIANT));
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
        buddyFocus={buddyFocus}
        buddyVariant={buddyVariant}
        buddyOutfit={effectiveBuddyOutfit}
      />

      {institutionShowcaseGrid}

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
    </>
  );
}
