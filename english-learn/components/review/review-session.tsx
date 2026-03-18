"use client";

import { BookMarked, CheckCircle2, Eye, LoaderCircle, RotateCcw, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ReviewCard {
  id: string;
  front: string;
  back: string;
  tag: string;
  stability: number;
  difficulty: number;
  due_at: string;
  last_reviewed_at: string | null;
  lapses: number;
  created_at: string;
}

interface ReviewStats {
  due: number;
  total: number;
  mature: number;
  at_risk: number;
}

const ratingLabels = [
  { value: 1 as const, label: "Forgot", emoji: "1", color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" },
  { value: 2 as const, label: "Hard", emoji: "2", color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" },
  { value: 3 as const, label: "Good", emoji: "3", color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" },
  { value: 4 as const, label: "Easy", emoji: "4", color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" },
] as const;

const tagStyle: Record<string, string> = {
  Reading: "bg-[#fff4e4] text-[#7b4b14]",
  Writing: "bg-[#edf6f1] text-[#1a493f]",
  Speaking: "bg-[#edf5fb] text-[#14324b]",
  Listening: "bg-[#f3edf8] text-[#4a2d6e]",
  general: "bg-[rgba(20,50,75,0.06)] text-[var(--ink-soft)]",
};

export function ReviewSession() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ due: 0, total: 0, mature: 0, at_risk: 0 });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/review-cards?filter=due");
      const data = await res.json();
      setCards(data.cards ?? []);
      setStats(data.stats ?? { due: 0, total: 0, mature: 0, at_risk: 0 });
      setCurrentIndex(0);
      setFlipped(false);
      setReviewed(0);
      setSessionDone(data.cards?.length === 0);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  async function handleRate(rating: 1 | 2 | 3 | 4) {
    const card = cards[currentIndex];
    if (!card || submitting) return;

    setSubmitting(true);

    try {
      await fetch("/api/review-cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: card.id,
          rating,
          stability: card.stability,
          difficulty: card.difficulty,
        }),
      });
    } catch {
      // Continue even if persist fails
    }

    setSubmitting(false);
    setReviewed((prev) => prev + 1);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setFlipped(false);
    } else {
      setSessionDone(true);
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!flipped && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setFlipped(true);
        return;
      }

      if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        handleRate(Number(e.key) as 1 | 2 | 3 | 4);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (loading) {
    return (
      <div className="surface-panel flex items-center justify-center gap-3 rounded-[2rem] p-12">
        <LoaderCircle className="size-5 animate-spin text-[var(--ink-soft)]" />
        <p className="text-sm text-[var(--ink-soft)]">Loading review deck…</p>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="surface-panel grid place-items-center gap-5 rounded-[2rem] p-10 text-center">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-[#edf6f1]">
          <Trophy className="size-7 text-[#1a493f]" />
        </div>
        <h2 className="font-display text-3xl tracking-tight text-[var(--ink)]">
          {reviewed > 0 ? "Review session complete!" : "No cards due right now."}
        </h2>
        <p className="max-w-md text-sm leading-7 text-[var(--ink-soft)]">
          {reviewed > 0
            ? `You reviewed ${reviewed} card${reviewed > 1 ? "s" : ""}. Cards will reappear based on your ratings and the SRS schedule.`
            : "Come back later, or add new vocabulary from reading articles and feedback sessions."}
        </p>
        {reviewed > 0 ? (
          <button
            type="button"
            onClick={fetchCards}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[rgba(20,50,75,0.06)]"
          >
            <RotateCcw className="size-4" />
            Check for more cards
          </button>
        ) : null}
      </div>
    );
  }

  const card = cards[currentIndex];
  if (!card) return null;

  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="grid gap-5">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-[var(--ink-soft)]">
          {currentIndex + 1} / {cards.length}
        </p>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgba(20,50,75,0.08)]">
          <div
            className="h-full rounded-full bg-[#7b4b14] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm font-medium text-[var(--ink-soft)]">{reviewed} reviewed</p>
      </div>

      {/* Flashcard */}
      <div className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-8">
        {/* Tag */}
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${tagStyle[card.tag] ?? tagStyle.general}`}
          >
            {card.tag}
          </span>
          {card.lapses > 0 ? (
            <span className="text-xs text-[var(--ink-soft)]">{card.lapses} lapse{card.lapses > 1 ? "s" : ""}</span>
          ) : null}
        </div>

        {/* Front */}
        <div className="min-h-32 rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Term</p>
          <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{card.front}</h3>
        </div>

        {/* Back (revealed) or flip button */}
        {flipped ? (
          <div className="min-h-32 rounded-[1.4rem] border border-[rgba(123,75,20,0.2)] bg-[rgba(247,234,210,0.3)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7b4b14]">Definition</p>
            <p className="mt-4 text-[15px] leading-8 text-[var(--ink)]">{card.back}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="inline-flex min-h-32 items-center justify-center gap-3 rounded-[1.4rem] border border-dashed border-[rgba(20,50,75,0.2)] bg-[rgba(255,255,255,0.5)] p-6 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
          >
            <Eye className="size-4" />
            Tap to reveal definition (or press Space)
          </button>
        )}

        {/* Rating buttons */}
        {flipped ? (
          <div className="grid gap-3">
            <p className="text-sm font-medium text-[var(--ink)]">How well did you recall this?</p>
            <div className="grid grid-cols-4 gap-2">
              {ratingLabels.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRate(r.value)}
                  disabled={submitting}
                  className={`rounded-[1.1rem] border px-3 py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${r.color}`}
                >
                  <span className="text-xs opacity-60">{r.emoji}</span>
                  <br />
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--ink-soft)]">
              Keyboard: press 1 (forgot) through 4 (easy) to rate quickly
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── Stats overview panel ──────────────────────────────────────── */

export function ReviewStatsPanel({ stats }: { stats: ReviewStats }) {
  const items = [
    { label: "Due today", value: stats.due, highlight: true },
    { label: "Total cards", value: stats.total, highlight: false },
    { label: "Mature cards", value: stats.mature, highlight: false },
    { label: "At-risk items", value: stats.at_risk, highlight: false },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className={item.highlight ? "surface-ink rounded-[1.8rem] p-5" : "surface-panel rounded-[1.8rem] p-5"}
        >
          <p
            className={
              item.highlight
                ? "text-xs uppercase tracking-[0.22em] text-[#f2d9ae]"
                : "text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]"
            }
          >
            {item.label}
          </p>
          <p
            className={
              item.highlight
                ? "font-display mt-3 text-4xl tracking-tight text-[#f7efe3]"
                : "font-display mt-3 text-4xl tracking-tight text-[var(--ink)]"
            }
          >
            {item.value}
          </p>
        </article>
      ))}
    </div>
  );
}
