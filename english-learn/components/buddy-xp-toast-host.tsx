"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { BuddyCompanion } from "@/components/home/buddy-companion";
import {
  getBuddyXpSourceLabel,
  subscribeBuddyXpEvents,
  type BuddyXpEventDetail,
} from "@/lib/buddy-xp-events";
import { type Locale } from "@/lib/i18n/dictionaries";

interface BuddyXpToast extends BuddyXpEventDetail {
  exiting: boolean;
}

const TOAST_LIFETIME_MS = 2600;
const TOAST_EXIT_MS = 320;

function getPreferredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem("english-learn:locale") === "zh" ? "zh" : "en";
}

export function BuddyXpToastHost() {
  const [locale, setLocale] = useState<Locale>("en");
  const [toasts, setToasts] = useState<BuddyXpToast[]>([]);

  useEffect(() => {
    const syncLocale = () => {
      setLocale(getPreferredLocale());
    };

    syncLocale();
    window.addEventListener("storage", syncLocale);

    const unsubscribe = subscribeBuddyXpEvents((detail) => {
      setToasts((current) => [...current, { ...detail, exiting: false }].slice(-3));

      window.setTimeout(() => {
        setToasts((current) =>
          current.map((toast) => (toast.id === detail.id ? { ...toast, exiting: true } : toast)),
        );
      }, TOAST_LIFETIME_MS);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== detail.id));
      }, TOAST_LIFETIME_MS + TOAST_EXIT_MS);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("storage", syncLocale);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-[5.75rem] z-[95] flex w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-3 sm:right-6">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={[
            "overflow-hidden rounded-[1.75rem] border-2 border-white/90",
            "bg-[linear-gradient(155deg,rgba(255,255,255,0.98),rgba(236,246,255,0.95),rgba(255,241,248,0.92))]",
            "px-4 py-3 shadow-[0_14px_0_rgba(143,196,255,0.22),0_24px_42px_rgba(90,123,255,0.16)] backdrop-blur-xl",
            toast.exiting
              ? "animate-[buddyXpToastOut_320ms_ease-in_forwards]"
              : "animate-[buddyXpToastIn_420ms_ease-out]",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <div className="relative h-20 w-20 shrink-0 rounded-[1.5rem] border-2 border-white/90 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.96),rgba(214,240,255,0.84)_58%,rgba(255,230,241,0.8))] shadow-[0_10px_0_rgba(255,201,225,0.2)]">
              <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fff6bd,#ffd6ef)] text-[var(--navy)] shadow-[0_6px_0_rgba(255,201,225,0.18)]">
                <Sparkles className="size-3.5" />
              </span>
              <BuddyCompanion
                stage="growing"
                focus="research"
                mood="happy"
                float={false}
                className="absolute inset-0 mx-auto my-auto w-[4.6rem]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Buddy XP
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--ink)]">
                {getBuddyXpSourceLabel(toast.source, locale)}
              </p>
              <div className="mt-2 inline-flex items-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,#7ac6ff,#5a7bff)] px-3 py-1 text-sm font-semibold text-white shadow-[0_8px_0_rgba(90,123,255,0.22)]">
                +{toast.xp} XP
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
