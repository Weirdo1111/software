"use client";

import { BrainCircuit, CalendarClock, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ReviewSession, ReviewStatsPanel } from "@/components/review/review-session";

interface ReviewStats {
  due: number;
  total: number;
  mature: number;
  at_risk: number;
}

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

export function ReviewPageShell() {
  const [stats, setStats] = useState<ReviewStats>({ due: 0, total: 0, mature: 0, at_risk: 0 });
  const [recentCards, setRecentCards] = useState<ReviewCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/review-cards?filter=all");
      const data = await res.json();
      setStats(data.stats ?? { due: 0, total: 0, mature: 0, at_risk: 0 });
      const allCards: ReviewCard[] = data.cards ?? [];
      const sortedByRecent = [...allCards].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setRecentCards(sortedByRecent.slice(0, 6));
    } catch {
      // Keep default state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20">
        <LoaderCircle className="size-5 animate-spin text-[var(--ink-soft)]" />
        <p className="text-sm text-[var(--ink-soft)]">Loading review data…</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Stats overview */}
      <ReviewStatsPanel stats={stats} />

      {/* Main content */}
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Review session */}
        <div>
          <ReviewSession />
        </div>

        {/* Sidebar */}
        <div className="grid gap-5">
          {/* Recent cards */}
          <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              Your vocabulary cards
            </p>
            <h2 className="font-display mt-4 text-2xl tracking-tight text-[var(--ink)]">
              {recentCards.length > 0 ? "Recently added to your deck." : "No cards in your deck yet."}
            </h2>
            {recentCards.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {recentCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--ink)]">{card.front}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)] line-clamp-2">{card.back}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[rgba(20,50,75,0.06)] px-2.5 py-1 text-xs font-medium text-[var(--ink-soft)]">
                        {card.tag}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-[var(--ink-soft)]">
                      <span>Stability: {card.stability}</span>
                      <span>Difficulty: {card.difficulty}</span>
                      {card.lapses > 0 ? <span>{card.lapses} lapse(s)</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                Add vocabulary from reading articles (select words while reading) or from feedback sessions
                (speaking, writing, reading). Cards you add will appear here and in your review sessions.
              </p>
            )}
          </article>

          {/* SRS explanation */}
          <article className="surface-ink ambient-card reveal-up rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f2d9ae]">How review works</p>
            <h2 className="font-display mt-4 text-3xl tracking-tight">Spaced repetition builds lasting memory.</h2>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.3rem] border border-white/12 bg-white/6 p-4">
                <div className="flex items-center gap-3 text-[#f7efe3]">
                  <BrainCircuit className="size-4 text-[#f2d9ae]" />
                  <p className="text-sm font-semibold">Cards you rate &ldquo;Easy&rdquo; appear less often</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#efe5d6]/70">
                  The SRS algorithm spaces intervals further apart as you demonstrate recall, so
                  well-known words stop wasting your time.
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-white/12 bg-white/6 p-4">
                <div className="flex items-center gap-3 text-[#f7efe3]">
                  <CalendarClock className="size-4 text-[#f2d9ae]" />
                  <p className="text-sm font-semibold">Forgotten cards come back quickly</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#efe5d6]/70">
                  If you rate a card &ldquo;Forgot&rdquo; or &ldquo;Hard&rdquo;, the interval shrinks and the
                  card is flagged as at-risk until retention stabilizes.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
