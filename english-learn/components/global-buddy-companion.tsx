"use client";

import { ArrowRight, LoaderCircle, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import {
  BuddyCompanion,
  type BuddyFace,
  type BuddyFocus,
  type BuddyMood,
  type BuddyStage,
  type BuddyVariant,
} from "@/components/home/buddy-companion";
import {
  createEmptyBuddyXpSummary,
  fetchBuddyXpSummary,
  getBuddyXpSummaryFromStorage,
  subscribeBuddyXpSources,
} from "@/lib/buddy-xp";
import { subscribeBuddyXpEvents } from "@/lib/buddy-xp-events";
import {
  DEFAULT_BUDDY_VARIANT,
  DEFAULT_BUDDY_OUTFIT,
  loadBuddyOutfitFromStorage,
  loadBuddyVariantFromStorage,
  subscribeBuddyOutfit,
  type BuddyOutfit,
} from "@/lib/buddy-wardrobe";
import {
  createEmptyLearningTrackerSnapshot,
  loadLearningTrackerSnapshotFromStorage,
  subscribeLearningTracker,
} from "@/lib/learning-tracker";
import { isBuddySoundEnabled, playBuddySound, setBuddySoundEnabled, unlockBuddySound } from "@/lib/buddy-sound";
import {
  getBuddyCurrentPageGuide,
  getBuddyDefaultQuestions,
  type BuddyGuideAction,
} from "@/lib/buddy-site-guide";
import { loadSchedulePreferencesFromStorage, subscribeSchedulePreferences } from "@/lib/schedule";

type UiLocale = "zh" | "en";
type BuddyReaction = "idle" | "blink" | "puff" | "bounce" | "wave" | "wobble" | "easter";
type BuddyReactionBubble = {
  text: string;
  plain?: boolean;
} | null;

type BuddyAssistantResponse = {
  mode: "faq" | "guide" | "ai";
  answer: string;
  actions: BuddyGuideAction[];
  quickReplies: string[];
  confidence: number;
};

function getStoredLevelPrefix() {
  if (typeof window === "undefined") return "A2";
  const next = String(window.localStorage.getItem("demo_level") ?? "A2").toUpperCase();
  return ["A1", "A2", "B1", "B2", "C1", "C2"].includes(next) ? next : "A2";
}

function getBuddyStage(xp: number): BuddyStage {
  if (xp >= 780) return "scholar";
  if (xp >= 440) return "explorer";
  if (xp >= 180) return "growing";
  return "fresh";
}

function getBuddyFocus(): BuddyFocus {
  const goal = loadSchedulePreferencesFromStorage("en").goal;
  if (goal === "research") return "research";
  if (goal === "seminar") return "seminar";
  return "coursework";
}

function getBuddyVariant(focus: BuddyFocus): BuddyVariant {
  if (focus === "research") return "bunny";
  if (focus === "seminar") return "cat";
  return "bear";
}

function getBuddyFocusFromVariant(variant: BuddyVariant): BuddyFocus {
  if (variant === "bunny") return "research";
  if (variant === "cat") return "seminar";
  return "coursework";
}

const MOODS: BuddyMood[] = ["happy", "proud", "calm", "happy"];
const FACE_EXPRESSIONS: BuddyFace[] = ["blink", "blush", "open", "sleepy", "surprised"];

const PAGE_GREETINGS: Record<
  string,
  Record<UiLocale, string[]>
> = {
  listening: {
    zh: ["\u542c\u4e00\u4e0b", "\u51c6\u5907\u542c\u4e86", "\u6234\u597d\u8033\u673a"],
    en: ["Ready?", "Listen up!", "Headphones?"],
  },
  reading: {
    zh: ["\u6162\u6162\u8bfb", "\u770b\u770b\u8fd9\u91cc", "\u6293\u5173\u952e\u8bcd"],
    en: ["Read on", "Take it slow", "Key words"],
  },
  speaking: {
    zh: ["\u5f00\u53e3\u5427", "\u8bd5\u8bd5\u770b", "\u8bf4\u51fa\u6765"],
    en: ["Go go!", "Speak up!", "Try it!"],
  },
  discussion: {
    zh: ["\u804a\u804a\u5427", "\u53bb\u770b\u770b", "\u6211\u4e5f\u5728"],
    en: ["Say hi", "Peek in", "I'm here"],
  },
  progress: {
    zh: ["\u6709\u8fdb\u6b65\u54e6", "\u770b\u770b\u6210\u7ee9", "\u7ee7\u7eed\u51b2"],
    en: ["Nice work", "Look here", "Keep going"],
  },
  schedule: {
    zh: ["\u5b89\u6392\u4e00\u4e0b", "\u4e00\u6b65\u4e00\u6b65", "\u4ece\u8fd9\u5f00\u59cb"],
    en: ["Plan it", "Step by step", "Start here"],
  },
  games: {
    zh: ["\u51b2\u51b2\u51b2", "\u8fd9\u91cc\u597d\u73a9", "\u51c6\u5907\u597d\u4e86"],
    en: ["Go go!", "So fun!", "Ready now?"],
  },
  default: {
    zh: ["\u51c6\u5907\u597d\u4e86\u5417", "\u7ee7\u7eed\u5417", "\u4f11\u606f\u4e00\u4e0b\uff1f"],
    en: ["Ready?", "Keep going?", "Short break?"],
  },
};

const CLICK_REACTIONS: Array<{
  reaction: Exclude<BuddyReaction, "idle" | "easter">;
  emoji: string;
}> = [
  { reaction: "blink", emoji: "owo" },
  { reaction: "puff", emoji: ">3<" },
  { reaction: "bounce", emoji: "^_^" },
];

const EASTER_EGGS: Record<UiLocale, string[]> = {
  zh: ["\u2764", "\u2728", "\uff1f\uff01"],
  en: ["<3", "*.*", "?!"],
};

function getPageGreetingKey(pathname: string) {
  if (pathname.startsWith("/listening")) return "listening";
  if (pathname.startsWith("/reading")) return "reading";
  if (pathname.includes("speaking") || pathname.startsWith("/lesson/")) return "speaking";
  if (pathname.startsWith("/discussion")) return "discussion";
  if (pathname.startsWith("/progress") || pathname.startsWith("/dashboard")) return "progress";
  if (pathname.startsWith("/schedule")) return "schedule";
  if (pathname.startsWith("/games") || pathname.startsWith("/quests")) return "games";
  return "default";
}

function resolveLocale(queryLang: string | null, storedLocale: string | null): UiLocale {
  if (queryLang === "zh" || queryLang === "en") return queryLang;
  if (storedLocale === "zh" || storedLocale === "en") return storedLocale;
  return "en";
}

export function GlobalBuddyCompanion() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState(() => createEmptyLearningTrackerSnapshot());
  const [xpSummary, setXpSummary] = useState(() => createEmptyBuddyXpSummary());
  const [face, setFace] = useState<BuddyFace>("happy");
  const [reactionBubble, setReactionBubble] = useState<BuddyReactionBubble>(null);
  const [moodIndex, setMoodIndex] = useState(0);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [storedLocale, setStoredLocale] = useState<UiLocale>("en");
  const [reaction, setReaction] = useState<BuddyReaction>("idle");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [outfit, setOutfit] = useState<BuddyOutfit>(DEFAULT_BUDDY_OUTFIT);
  const [variant, setVariant] = useState<BuddyVariant>(DEFAULT_BUDDY_VARIANT);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [assistantResponse, setAssistantResponse] = useState<BuddyAssistantResponse | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [levelPrefix, setLevelPrefix] = useState("A2");
  const greetingTimerRef = useRef<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);
  const faceTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);
  const clickResetTimerRef = useRef<number | null>(null);
  const xpReactionTimerRef = useRef<number | null>(null);
  const reactionRef = useRef<BuddyReaction>("idle");
  const semanticTimerRef = useRef<number | null>(null);
  const pageWelcomeRef = useRef(pathname);
  const scrollTickingRef = useRef(false);
  const prevCompletedRef = useRef(0);
  const [clickCount, setClickCount] = useState(0);

  const locale = resolveLocale(searchParams.get("lang"), storedLocale);
  const greetingKey = getPageGreetingKey(pathname);
  const greetingPool = PAGE_GREETINGS[greetingKey]?.[locale] ?? PAGE_GREETINGS.default[locale];
  const currentPageGuide = useMemo(
    () => getBuddyCurrentPageGuide(locale, pathname, levelPrefix),
    [levelPrefix, locale, pathname],
  );
  const defaultQuestions = useMemo(
    () => getBuddyDefaultQuestions(locale, pathname).slice(0, 4),
    [locale, pathname],
  );

  useEffect(() => {
    const refresh = () => {
      const nextFocus = getBuddyFocus();
      setSnapshot(loadLearningTrackerSnapshotFromStorage());
      setXpSummary(getBuddyXpSummaryFromStorage());
      setVariant(loadBuddyVariantFromStorage(getBuddyVariant(nextFocus)));
      setOutfit(loadBuddyOutfitFromStorage());
      setStoredLocale(resolveLocale(null, window.localStorage.getItem("english-learn:locale")));
      setSoundEnabled(isBuddySoundEnabled());
      setIsLoggedIn(window.localStorage.getItem("demo_logged_in") === "true");
      setLevelPrefix(getStoredLevelPrefix());
    };

    refresh();
    void fetchBuddyXpSummary()
      .then((summary) => setXpSummary(summary))
      .catch(() => undefined);
    const unsubTracker = subscribeLearningTracker(refresh);
    const unsubBuddyXp = subscribeBuddyXpSources(refresh);
    const unsubPrefs = subscribeSchedulePreferences(refresh);
    const unsubOutfit = subscribeBuddyOutfit(refresh);
    const onStorage = () => {
      setStoredLocale(resolveLocale(null, window.localStorage.getItem("english-learn:locale")));
      setIsLoggedIn(window.localStorage.getItem("demo_logged_in") === "true");
      setLevelPrefix(getStoredLevelPrefix());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("demo-auth-changed", refresh as EventListener);
    window.addEventListener("demo-placement-changed", refresh as EventListener);

    return () => {
      unsubTracker();
      unsubBuddyXp();
      unsubPrefs();
      unsubOutfit();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("demo-auth-changed", refresh as EventListener);
      window.removeEventListener("demo-placement-changed", refresh as EventListener);
    };
  }, []);

  useEffect(() => {
    reactionRef.current = reaction;
  }, [reaction]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (reactionRef.current !== "idle") return;
      setMoodIndex((value) => (value + 1) % MOODS.length);
      const nextFace = FACE_EXPRESSIONS[Math.floor(Math.random() * FACE_EXPRESSIONS.length)] ?? "happy";
      setFace(nextFace);
      if (faceTimerRef.current) window.clearTimeout(faceTimerRef.current);
      faceTimerRef.current = window.setTimeout(() => {
        setFace("happy");
        faceTimerRef.current = null;
      }, 1400);
    }, 5200);

    return () => {
      window.clearInterval(intervalId);
      if (faceTimerRef.current) {
        window.clearTimeout(faceTimerRef.current);
        faceTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const showGreeting = () => {
      setGreeting(greetingPool[Math.floor(Math.random() * greetingPool.length)] ?? null);
      if (greetingTimerRef.current) window.clearTimeout(greetingTimerRef.current);
      greetingTimerRef.current = window.setTimeout(() => {
        setGreeting(null);
        greetingTimerRef.current = null;
      }, 1800);
    };

    showGreeting();
    const intervalId = window.setInterval(showGreeting, 9000);

    return () => {
      window.clearInterval(intervalId);
      if (greetingTimerRef.current) {
        window.clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = null;
      }
    };
  }, [greetingPool]);

  useEffect(() => {
    return () => {
      if (reactionTimerRef.current) {
        window.clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = null;
      }
      if (faceTimerRef.current) {
        window.clearTimeout(faceTimerRef.current);
        faceTimerRef.current = null;
      }
      if (bubbleTimerRef.current) {
        window.clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = null;
      }
      if (clickResetTimerRef.current) {
        window.clearTimeout(clickResetTimerRef.current);
        clickResetTimerRef.current = null;
      }
      if (xpReactionTimerRef.current) {
        window.clearTimeout(xpReactionTimerRef.current);
        xpReactionTimerRef.current = null;
      }
      if (semanticTimerRef.current) {
        window.clearTimeout(semanticTimerRef.current);
        semanticTimerRef.current = null;
      }
    };
  }, []);

  const xp = xpSummary.totalXp;
  const totalCompleted = xpSummary.totalCompletedSources;

  const stage = getBuddyStage(xp);
  const mood = MOODS[moodIndex];
  const renderFocus = getBuddyFocusFromVariant(variant);
  const activeBubbleText = reactionBubble?.text ?? greeting;
  const isPlainBubble = Boolean(reactionBubble?.plain);
  const displayedAssistantAnswer = assistantResponse?.answer ?? currentPageGuide.answer;
  const displayedAssistantActions =
    assistantResponse?.actions?.length ? assistantResponse.actions : currentPageGuide.actions;
  const displayedQuickReplies =
    assistantResponse?.quickReplies?.length ? assistantResponse.quickReplies : defaultQuestions;

  const playSoundIfEnabled = (kind: Parameters<typeof playBuddySound>[0]) => {
    if (!soundEnabled) return;
    void playBuddySound(kind);
  };

  const navigateFromAssistant = (action: BuddyGuideAction) => {
    const targetHref =
      action.requiresLogin && !isLoggedIn
        ? `/auth/sign-in?lang=${locale}`
        : action.href;

    router.push(targetHref);
    setAssistantOpen(false);
    setAssistantError("");
    setAssistantQuery("");
    setAssistantResponse(null);
    triggerReaction("wave", locale === "zh" ? "带你去" : "Let's go", "open", 760);
    playSoundIfEnabled("wave");
  };

  const askBuddyAssistant = async (nextQuery: string) => {
    const trimmedQuery = nextQuery.trim();

    if (!trimmedQuery) {
      setAssistantResponse(null);
      setAssistantError("");
      return;
    }

    setAssistantLoading(true);
    setAssistantError("");

    try {
      const response = await fetch("/api/buddy/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmedQuery,
          locale,
          pathname,
          levelPrefix,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as Partial<BuddyAssistantResponse> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to get buddy guidance.");
      }

      const normalizedActions = Array.isArray(payload.actions) ? payload.actions : [];
      const normalizedQuickReplies = Array.isArray(payload.quickReplies) ? payload.quickReplies : [];

      setAssistantResponse({
        mode: payload.mode === "faq" || payload.mode === "guide" || payload.mode === "ai" ? payload.mode : "guide",
        answer: String(payload.answer ?? "").trim() || currentPageGuide.answer,
        actions: normalizedActions,
        quickReplies: normalizedQuickReplies,
        confidence:
          typeof payload.confidence === "number" && Number.isFinite(payload.confidence)
            ? payload.confidence
            : 0.5,
      });
      triggerReaction("blink", locale === "zh" ? "收到" : "Got it", "blink", 620);
      playSoundIfEnabled("click");
    } catch (error) {
      setAssistantError(
        error instanceof Error
          ? error.message
          : locale === "zh"
            ? "导航回答获取失败，请重试。"
            : "Failed to get navigation help. Please retry.",
      );
    } finally {
      setAssistantLoading(false);
    }
  };

  const triggerReaction = (
    nextReaction: BuddyReaction,
    bubbleText: string | null,
    nextFace: BuddyFace,
    duration = 650,
    plainBubble = false,
  ) => {
    setReaction(nextReaction);
    reactionRef.current = nextReaction;
    setReactionBubble(bubbleText ? { text: bubbleText, plain: plainBubble } : null);
    setFace(nextFace);

    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => {
      setReaction("idle");
      reactionRef.current = "idle";
      reactionTimerRef.current = null;
    }, duration);

    if (faceTimerRef.current) window.clearTimeout(faceTimerRef.current);
    faceTimerRef.current = window.setTimeout(() => {
      setFace("happy");
      faceTimerRef.current = null;
    }, 900);

    if (bubbleText) {
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = window.setTimeout(() => {
        setReactionBubble(null);
        bubbleTimerRef.current = null;
      }, plainBubble ? 2000 : 1500);
    }
  };

  useEffect(() => {
    if (pageWelcomeRef.current === pathname) return;
    pageWelcomeRef.current = pathname;
    setAssistantResponse(null);
    setAssistantError("");
    setAssistantQuery("");
    setFace("happy");
    triggerReaction("wave", locale === "zh" ? "\u8bf4\u51fa\u6765" : "Speak up!", "blink", 900);
    playSoundIfEnabled("wave");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, pathname]);

  useEffect(() => {
    const onScroll = () => {
      if (scrollTickingRef.current || reactionRef.current !== "idle") return;
      scrollTickingRef.current = true;
      window.requestAnimationFrame(() => {
        setReaction("wobble");
        reactionRef.current = "wobble";
        if (semanticTimerRef.current) window.clearTimeout(semanticTimerRef.current);
        semanticTimerRef.current = window.setTimeout(() => {
          setReaction("idle");
          reactionRef.current = "idle";
          semanticTimerRef.current = null;
        }, 420);
        scrollTickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!assistantOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAssistantOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [assistantOpen]);

  useEffect(() => {
    const onSubmit = () => {
      triggerReaction("bounce", locale === "zh" ? "\u8036" : "yay", "open", 720);
      playSoundIfEnabled("bounce");
    };

    document.addEventListener("submit", onSubmit, true);
    return () => document.removeEventListener("submit", onSubmit, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, soundEnabled]);

  useEffect(() => {
    if (prevCompletedRef.current !== 0 && totalCompleted > prevCompletedRef.current) {
      triggerReaction("bounce", locale === "zh" ? "\u597d\u68d2" : "nice", "open", 760);
      playSoundIfEnabled("bounce");
    }
    prevCompletedRef.current = totalCompleted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, totalCompleted, soundEnabled]);

  useEffect(() => {
    const unsubscribe = subscribeBuddyXpEvents((detail) => {
      if (xpReactionTimerRef.current) {
        window.clearTimeout(xpReactionTimerRef.current);
      }
      xpReactionTimerRef.current = window.setTimeout(() => {
        triggerReaction("bounce", `+${detail.xp} XP`, "open", 760, true);
        playSoundIfEnabled("bounce");
        xpReactionTimerRef.current = null;
      }, 90);
    });

    return () => {
      unsubscribe();
      if (xpReactionTimerRef.current) {
        window.clearTimeout(xpReactionTimerRef.current);
        xpReactionTimerRef.current = null;
      }
    };
  }, [soundEnabled]);

  if (pathname.startsWith("/games/word-game")) return null;

  return (
    <div className="global-buddy-shell">
      <section
        className={`global-buddy-assistant-panel${assistantOpen ? " global-buddy-assistant-panel-open" : ""}`}
        aria-hidden={!assistantOpen}
      >
        <div className="global-buddy-assistant-header">
          <div>
            <p className="global-buddy-assistant-eyebrow">
              {locale === "zh" ? "Buddy 导航" : "Buddy Guide"}
            </p>
            <h2 className="global-buddy-assistant-title">
              {locale === "zh" ? "问我网站怎么用" : "Ask how the site works"}
            </h2>
          </div>
          <button
            type="button"
            className="global-buddy-assistant-close"
            onClick={() => setAssistantOpen(false)}
            aria-label={locale === "zh" ? "关闭助手面板" : "Close buddy guide"}
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="global-buddy-assistant-answer" lang={locale === "zh" ? "zh-CN" : "en"}>
          {displayedAssistantAnswer}
        </p>

        <div className="global-buddy-assistant-actions">
          {displayedAssistantActions.map((action) => (
            <button
              key={`${action.id}:${action.href}`}
              type="button"
              className="global-buddy-assistant-action"
              onClick={() => navigateFromAssistant(action)}
            >
              <span>{action.label}</span>
              <ArrowRight className="size-4" />
            </button>
          ))}
        </div>

        <div className="global-buddy-assistant-quick-list">
          {displayedQuickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              className="global-buddy-assistant-chip"
              onClick={() => {
                setAssistantQuery(reply);
                void askBuddyAssistant(reply);
              }}
            >
              {reply}
            </button>
          ))}
        </div>

        <form
          className="global-buddy-assistant-form"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void askBuddyAssistant(assistantQuery);
          }}
        >
          <input
            type="text"
            value={assistantQuery}
            onChange={(event) => setAssistantQuery(event.target.value)}
            autoComplete="off"
            aria-label={locale === "zh" ? "桌宠导航提问输入框" : "Buddy guide question input"}
            placeholder={
              locale === "zh"
                ? "比如：阅读批改在哪里"
                : "For example: where is reading feedback"
            }
            className="global-buddy-assistant-input"
          />
          <button
            type="submit"
            className="global-buddy-assistant-submit"
            disabled={assistantLoading}
          >
            {assistantLoading ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {locale === "zh" ? "发送" : "Ask"}
          </button>
        </form>

        {assistantError ? (
          <p className="global-buddy-assistant-error" lang={locale === "zh" ? "zh-CN" : "en"}>
            {assistantError}
          </p>
        ) : null}
      </section>

      <div className={`global-buddy-card${reaction !== "idle" ? ` global-buddy-card-${reaction}` : ""}`}>
        <span className="global-buddy-shadow" />
        {activeBubbleText ? (
          <span
            className={isPlainBubble ? "global-buddy-xp-text" : "global-buddy-greeting"}
            lang={locale === "zh" ? "zh-CN" : "en"}
          >
            {activeBubbleText}
          </span>
        ) : null}
        {isPlainBubble ? (
          <>
            <span className="global-buddy-star global-buddy-star-one">✦</span>
            <span className="global-buddy-star global-buddy-star-two">✦</span>
            <span className="global-buddy-star global-buddy-star-three">✦</span>
          </>
        ) : null}
        <button
          type="button"
          className={`global-buddy-sound-toggle${soundEnabled ? " global-buddy-sound-toggle-on" : ""}`}
          onClick={() => {
            const nextEnabled = !soundEnabled;
            setSoundEnabled(nextEnabled);
            setBuddySoundEnabled(nextEnabled);
            if (nextEnabled) {
              void unlockBuddySound().then(() => playBuddySound("wave"));
            }
          }}
          aria-label={soundEnabled ? (locale === "zh" ? "\u5173\u95ed\u684c\u5ba0\u97f3\u6548" : "Turn buddy sound off") : (locale === "zh" ? "\u5f00\u542f\u684c\u5ba0\u97f3\u6548" : "Turn buddy sound on")}
        >
          {soundEnabled ? "\uD83D\uDD0A" : "\uD83D\uDD07"}
        </button>
        <button
          type="button"
          className="global-buddy-button"
          onClick={() => {
            setAssistantOpen(true);
            setAssistantError("");
            void unlockBuddySound();
            const nextCount = clickCount + 1;
            setClickCount(nextCount);

            if (clickResetTimerRef.current) window.clearTimeout(clickResetTimerRef.current);
            clickResetTimerRef.current = window.setTimeout(() => {
              setClickCount(0);
              clickResetTimerRef.current = null;
            }, 1400);

            if (nextCount >= 3) {
              triggerReaction(
                "easter",
                EASTER_EGGS[locale][nextCount % EASTER_EGGS[locale].length] ?? EASTER_EGGS[locale][0],
                "surprised",
              );
              playSoundIfEnabled("easter");
              setClickCount(0);
              if (clickResetTimerRef.current) {
                window.clearTimeout(clickResetTimerRef.current);
                clickResetTimerRef.current = null;
              }
              return;
            }

            const nextReaction = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)] ?? CLICK_REACTIONS[0];
            const nextFace =
              nextReaction.reaction === "blink"
                ? "blink"
                : nextReaction.reaction === "puff"
                  ? "blush"
                  : "open";
            triggerReaction(nextReaction.reaction, nextReaction.emoji, nextFace);
            playSoundIfEnabled(nextReaction.reaction === "bounce" ? "bounce" : "click");
          }}
          aria-label={locale === "zh" ? "点击桌宠打开导航助手" : "Click buddy to open the guide"}
        >
          <span className="global-buddy-figure">
            <BuddyCompanion
              stage={stage}
              focus={renderFocus}
              variant={variant}
              mood={mood}
              face={face}
              outfit={outfit}
              className="global-buddy-avatar"
            />
          </span>
        </button>
      </div>
    </div>
  );
}
