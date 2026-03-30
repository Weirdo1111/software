"use client";

import Link from "next/link";
import { BookText, CheckCircle2, Lightbulb, Tags } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { writingDisciplineLabels, type WritingDiscipline } from "@/lib/writing-language-bank";
import {
  difficultyOptions,
  getDifficultyLabel,
  getLevelForDifficulty,
  type DifficultyLabel,
} from "@/lib/level-labels";
import type { CEFRLevel } from "@/types/learning";

const disciplines: WritingDiscipline[] = ["computing", "transport", "maths", "mechanical", "civil"];

type StudyItem = {
  id: string;
  kind: "vocabulary" | "sentence";
  discipline: WritingDiscipline;
  level: CEFRLevel;
  title: string;
  content: string;
  detail: string;
};

type SnapshotResponse = {
  title: string;
  vocabulary: StudyItem[];
  sentences: StudyItem[];
  totals: {
    all: number;
    mastered: number;
    unmastered: number;
  };
};

function formatDifficulty(level: CEFRLevel) {
  return getDifficultyLabel(level);
}

async function fetchSnapshot(userKey: string, discipline: WritingDiscipline, level: CEFRLevel) {
  const params = new URLSearchParams({
    userKey,
    discipline,
    level,
  });
  const response = await fetch(`/api/writing/language-items?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load writing language bank");
  }

  return (await response.json()) as SnapshotResponse;
}

export function WritingLanguageLab({ defaultLevel = "B1" }: { defaultLevel?: CEFRLevel }) {
  const [discipline, setDiscipline] = useState<WritingDiscipline>("computing");
  const easyBaseline: "A1" | "A2" = defaultLevel === "A1" ? "A1" : "A2";
  const [targetDifficulty, setTargetDifficulty] = useState<DifficultyLabel>(getDifficultyLabel(defaultLevel));
  const targetLevel = getLevelForDifficulty(targetDifficulty, easyBaseline);
  const [userKey, setUserKey] = useState("guest");
  const [userReady, setUserReady] = useState(false);
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startLoadingTransition] = useTransition();
  const [isMarking, startMarkingTransition] = useTransition();

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
        const nextSnapshot = await fetchSnapshot(userKey, discipline, targetLevel);

        if (!cancelled) {
          setSnapshot(nextSnapshot);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load writing language bank");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [discipline, targetLevel, userKey, userReady]);

  function handleMarkMastered(itemId: string) {
    startMarkingTransition(async () => {
      try {
        setError(null);
        const response = await fetch("/api/writing/language-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userKey,
            itemId,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Failed to update mastery");
        }

        const refreshed = await fetchSnapshot(userKey, discipline, targetLevel);
        setSnapshot(refreshed);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to update mastery");
      }
    });
  }

  const vocabulary = snapshot?.vocabulary ?? [];
  const sentences = snapshot?.sentences ?? [];

  return (
    <section className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-7">
      <div>
        <p className="section-label">
          <BookText className="size-3.5" /> Writing language lab
        </p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          Study writing vocabulary and sentence patterns by major and difficulty.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
          Each item comes from the unlearned database first. When you mark one as mastered, it moves into your mastered database and the page automatically fills the gap with the next available unlearned item.
        </p>
      </div>

      <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            Major
            <select
              value={discipline}
              onChange={(event) => setDiscipline(event.target.value as WritingDiscipline)}
              className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
            >
              {disciplines.map((item) => (
                <option key={item} value={item}>
                  {writingDisciplineLabels[item]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
            Difficulty
            <select
              value={targetDifficulty}
              onChange={(event) => setTargetDifficulty(event.target.value as DifficultyLabel)}
              className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
            >
              {difficultyOptions.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[rgba(33,91,169,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--navy)]">
                {writingDisciplineLabels[discipline]}
              </span>
              <span className="rounded-full bg-[rgba(186,122,47,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f5c1b]">
                {formatDifficulty(targetLevel)}
              </span>
              <span className="rounded-full bg-[rgba(20,50,75,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                User {userKey}
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--ink)]">{snapshot?.title ?? "Loading language bank..."}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
              Unlearned bank: {snapshot?.totals.unmastered ?? 0} items left. Mastered bank: {snapshot?.totals.mastered ?? 0} items.
            </p>
          </div>

          <Link
            href="/writing/mastered"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(20,50,75,0.14)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-white"
          >
            View mastered page
          </Link>
        </div>

        {error ? <p className="mt-4 text-sm text-[#9f3f34]">{error}</p> : null}
      </div>

      <article className="rounded-[1.5rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-5">
        <p className="section-label">
          <Tags className="size-3.5" /> Unlearned vocabulary
        </p>
        <div className="mt-4 grid gap-3">
          {vocabulary.map((item) => (
            <div key={item.id} className="rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-[var(--ink)]">{item.content}</p>
                  <span className="rounded-full bg-[rgba(33,91,169,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--navy)]">
                    {writingDisciplineLabels[item.discipline]}
                  </span>
                  <span className="rounded-full bg-[rgba(186,122,47,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5c1b]">
                    {getDifficultyLabel(item.level)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleMarkMastered(item.id)}
                  disabled={isMarking}
                  className="rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add to mastered
                </button>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.detail}</p>
            </div>
          ))}
          {!isLoading && vocabulary.length === 0 ? (
            <div className="rounded-[1.1rem] border border-dashed border-[rgba(20,50,75,0.16)] bg-white/70 px-4 py-5 text-sm leading-7 text-[var(--ink-soft)]">
              No unlearned vocabulary is left in this set. Try another major or difficulty, or check your mastered page.
            </div>
          ) : null}
        </div>
      </article>

      <article className="rounded-[1.5rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-5">
        <p className="section-label">
          <Lightbulb className="size-3.5" /> Unlearned sentence models
        </p>
        <div className="mt-4 grid gap-3">
          {sentences.map((item) => (
            <div key={item.id} className="rounded-[1.1rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[rgba(33,91,169,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--navy)]">
                    {writingDisciplineLabels[item.discipline]}
                  </span>
                  <span className="rounded-full bg-[rgba(186,122,47,0.1)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5c1b]">
                    {getDifficultyLabel(item.level)}
                  </span>
                  <span className="rounded-full bg-[rgba(20,50,75,0.08)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    {item.detail}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleMarkMastered(item.id)}
                  disabled={isMarking}
                  className="rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add to mastered
                </button>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{item.content}</p>
            </div>
          ))}
          {!isLoading && sentences.length === 0 ? (
            <div className="rounded-[1.1rem] border border-dashed border-[rgba(20,50,75,0.16)] bg-white/70 px-4 py-5 text-sm leading-7 text-[var(--ink-soft)]">
              No unlearned sentence models are left in this set. Try another filter or open the mastered page to review what you have saved.
            </div>
          ) : null}
        </div>
      </article>

      {isLoading || isMarking ? (
        <p className="inline-flex items-center gap-2 text-sm text-[var(--ink-soft)]">
          <CheckCircle2 className="size-4" /> Updating your language bank...
        </p>
      ) : null}
    </section>
  );
}
