"use client";

import Link from "next/link";
import { BookMarked, Lightbulb, Tags } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { writingDisciplineLabels, type WritingDiscipline } from "@/lib/writing-language-bank";
import type { CEFRLevel } from "@/types/learning";

type MasteredItem = {
  id: string;
  kind: "vocabulary" | "sentence";
  discipline: WritingDiscipline;
  level: CEFRLevel;
  title: string;
  content: string;
  detail: string;
  masteredAt: string;
};

export function MasteredLanguagePageShell() {
  const [userKey, setUserKey] = useState("guest");
  const [userReady, setUserReady] = useState(false);
  const [items, setItems] = useState<MasteredItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startLoadingTransition] = useTransition();

  useEffect(() => {
    const localUser = window.localStorage.getItem("demo_user")?.trim();
    setUserKey(localUser || "guest");
    setUserReady(true);
  }, []);

  useEffect(() => {
    if (!userReady) return;

    let cancelled = false;

    startLoadingTransition(async () => {
      try {
        setError(null);
        const params = new URLSearchParams({
          view: "mastered",
          userKey,
        });
        const response = await fetch(`/api/writing/language-items?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load mastered language items");
        }

        const payload = (await response.json()) as { items: MasteredItem[] };
        if (!cancelled) {
          setItems(payload.items);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load mastered language items");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userKey, userReady]);

  const vocabulary = useMemo(() => items.filter((item) => item.kind === "vocabulary"), [items]);
  const sentences = useMemo(() => items.filter((item) => item.kind === "sentence"), [items]);

  return (
    <section className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">
            <BookMarked className="size-3.5" /> Mastered language bank
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            Review the vocabulary and sentence patterns you have already mastered.
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            This page reads from your mastered database and groups together every writing item you have marked as confident.
          </p>
        </div>

        <Link
          href="/lesson/A2-writing-starter?module=language-lab"
          className="inline-flex items-center justify-center rounded-full border border-[rgba(20,50,75,0.14)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-white"
        >
          Back to language lab
        </Link>
      </div>

      <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[rgba(33,91,169,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--navy)]">
            User {userKey}
          </span>
          <span className="rounded-full bg-[rgba(186,122,47,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f5c1b]">
            {items.length} mastered items
          </span>
        </div>
        {error ? <p className="mt-3 text-sm text-[#9f3f34]">{error}</p> : null}
        {isLoading ? <p className="mt-3 text-sm text-[var(--ink-soft)]">Loading mastered items...</p> : null}
      </div>

      <article className="rounded-[1.5rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-5">
        <p className="section-label">
          <Tags className="size-3.5" /> Mastered vocabulary
        </p>
        <div className="mt-4 grid gap-3">
          {vocabulary.map((item) => (
            <div key={item.id} className="rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-[var(--ink)]">{item.content}</p>
                <span className="rounded-full bg-[rgba(33,91,169,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--navy)]">
                  {writingDisciplineLabels[item.discipline]}
                </span>
                <span className="rounded-full bg-[rgba(186,122,47,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5c1b]">
                  {item.level}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.detail}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                Mastered on {new Date(item.masteredAt).toLocaleString()}
              </p>
            </div>
          ))}
          {!isLoading && vocabulary.length === 0 ? (
            <div className="rounded-[1.1rem] border border-dashed border-[rgba(20,50,75,0.16)] bg-white/70 px-4 py-5 text-sm leading-7 text-[var(--ink-soft)]">
              No mastered vocabulary yet. Go back to the writing language lab and add some items.
            </div>
          ) : null}
        </div>
      </article>

      <article className="rounded-[1.5rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-5">
        <p className="section-label">
          <Lightbulb className="size-3.5" /> Mastered sentence models
        </p>
        <div className="mt-4 grid gap-3">
          {sentences.map((item) => (
            <div key={item.id} className="rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[rgba(33,91,169,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--navy)]">
                  {writingDisciplineLabels[item.discipline]}
                </span>
                <span className="rounded-full bg-[rgba(186,122,47,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5c1b]">
                  {item.level}
                </span>
                <span className="rounded-full bg-[rgba(20,50,75,0.08)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                  {item.detail}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{item.content}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                Mastered on {new Date(item.masteredAt).toLocaleString()}
              </p>
            </div>
          ))}
          {!isLoading && sentences.length === 0 ? (
            <div className="rounded-[1.1rem] border border-dashed border-[rgba(20,50,75,0.16)] bg-white/70 px-4 py-5 text-sm leading-7 text-[var(--ink-soft)]">
              No mastered sentence models yet. Add some from the language lab first.
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
