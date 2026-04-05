"use client";

const BUDDY_PAGE_EVENT = "english-learn:buddy-page:event";

export type BuddyPageReaction = "blink" | "puff" | "bounce" | "wave" | "wobble" | "easter";
export type BuddyPageFace = "happy" | "blink" | "blush" | "open" | "sleepy" | "surprised";
export type BuddyPageSound = "click" | "bounce" | "wave" | "easter";

export interface BuddyPageEventDetail {
  id: string;
  text: {
    zh: string;
    en: string;
  };
  reaction?: BuddyPageReaction;
  face?: BuddyPageFace;
  sound?: BuddyPageSound;
  durationMs?: number;
  plain?: boolean;
}

export function emitBuddyPageEvent(input: Omit<BuddyPageEventDetail, "id"> & { id?: string }) {
  if (typeof window === "undefined") return;

  const detail: BuddyPageEventDetail = {
    id: input.id ?? `buddy-page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reaction: "blink",
    face: "open",
    sound: "click",
    durationMs: 1400,
    plain: false,
    ...input,
  };

  window.dispatchEvent(new CustomEvent<BuddyPageEventDetail>(BUDDY_PAGE_EVENT, { detail }));
}

export function subscribeBuddyPageEvents(callback: (detail: BuddyPageEventDetail) => void) {
  if (typeof window === "undefined") return () => {};

  const onEvent = (event: Event) => {
    const detail = (event as CustomEvent<BuddyPageEventDetail>).detail;
    if (detail) {
      callback(detail);
    }
  };

  window.addEventListener(BUDDY_PAGE_EVENT, onEvent as EventListener);
  return () => {
    window.removeEventListener(BUDDY_PAGE_EVENT, onEvent as EventListener);
  };
}
