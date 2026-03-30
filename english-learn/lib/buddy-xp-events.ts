import { type Locale } from "@/lib/i18n/dictionaries";
import { type BuddyXpAwardSource, getBuddyXpForSource } from "@/lib/buddy-xp-config";

const BUDDY_XP_EVENT = "english-learn:buddy-xp:earned";

export interface BuddyXpEventDetail {
  id: string;
  source: BuddyXpAwardSource;
  xp: number;
  createdAt: string;
}

export function emitBuddyXpEvent(source: BuddyXpAwardSource) {
  if (typeof window === "undefined") return;

  const detail: BuddyXpEventDetail = {
    id: `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    xp: getBuddyXpForSource(source),
    createdAt: new Date().toISOString(),
  };

  window.dispatchEvent(new CustomEvent<BuddyXpEventDetail>(BUDDY_XP_EVENT, { detail }));
}

export function subscribeBuddyXpEvents(callback: (detail: BuddyXpEventDetail) => void) {
  if (typeof window === "undefined") return () => {};

  const onEvent = (event: Event) => {
    const detail = (event as CustomEvent<BuddyXpEventDetail>).detail;
    if (detail) callback(detail);
  };

  window.addEventListener(BUDDY_XP_EVENT, onEvent as EventListener);
  return () => {
    window.removeEventListener(BUDDY_XP_EVENT, onEvent as EventListener);
  };
}

export function getBuddyXpSourceLabel(source: BuddyXpAwardSource, locale: Locale) {
  if (source === "listeningCompletion") {
    return locale === "zh" ? "Listening 完成" : "Listening complete";
  }
  if (source === "speakingCompletion") {
    return locale === "zh" ? "Speaking 完成" : "Speaking complete";
  }
  if (source === "readingCompletion") {
    return locale === "zh" ? "Reading 完成" : "Reading complete";
  }
  if (source === "writingCompletion") {
    return locale === "zh" ? "Writing 完成" : "Writing complete";
  }
  if (source === "reviewSession") {
    return locale === "zh" ? "Review 完成" : "Review complete";
  }
  if (source === "escapeRoomClear") {
    return locale === "zh" ? "Quest Arcade 通关" : "Quest Arcade clear";
  }
  if (source === "dormLockoutClear") {
    return locale === "zh" ? "Dorm Lockout 通关" : "Dorm Lockout clear";
  }
  return locale === "zh" ? "Last Train Escape 通关" : "Last Train Escape clear";
}
