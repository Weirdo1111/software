"use client";

import { useSearchParams } from "next/navigation";
import { BrainCircuit, CalendarClock, Clock, Filter, LoaderCircle, Trash2 } from "lucide-react";
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

interface ReviewHistoryEntry {
  id: string;
  card_front: string;
  rating: number;
  reviewed_at: string;
}

const TAG_OPTIONS = ["All", "Reading", "Writing", "Speaking", "Listening", "general"] as const;

const tagStyle: Record<string, string> = {
  Reading: "bg-[#fff4e4] text-[#7b4b14]",
  Writing: "bg-[#edf6f1] text-[#1a493f]",
  Speaking: "bg-[#edf5fb] text-[#14324b]",
  Listening: "bg-[#f3edf8] text-[#4a2d6e]",
  general: "bg-[rgba(20,50,75,0.06)] text-[var(--ink-soft)]",
};

const ratingLabel: Record<number, { text: string; color: string }> = {
  1: { text: "Forgot", color: "text-red-600" },
  2: { text: "Hard", color: "text-amber-600" },
  3: { text: "Good", color: "text-emerald-600" },
  4: { text: "Easy", color: "text-blue-600" },
};

export function ReviewPageShell({ initialTag = "All" }: { initialTag?: string }) {
  const searchParams = useSearchParams();
  const promptFilter = searchParams.get("prompt")?.trim() || "";
  const scenarioText = searchParams.get("scenario")?.trim() || "";
  const taskText = searchParams.get("task")?.trim() || "";
  const queryTag = searchParams.get("tag");
  const [stats, setStats] = useState<ReviewStats>({ due: 0, total: 0, mature: 0, at_risk: 0 });
  const [allCards, setAllCards] = useState<ReviewCard[]>([]);
  const [recentCards, setRecentCards] = useState<ReviewCard[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>(initialTag);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = useCallback(async (tag?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter: "all" });
      if (tag && tag !== "All") params.set("tag", tag);
      const res = await fetch(`/api/review-cards?${params}`);
      const data = await res.json();
      setStats(data.stats ?? { due: 0, total: 0, mature: 0, at_risk: 0 });
      const allCards: ReviewCard[] = data.cards ?? [];
      setAllCards(allCards);
      const sortedByRecent = [...allCards].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setRecentCards(sortedByRecent.slice(0, 8));
      setReviewHistory(data.review_history ?? []);
    } catch {
      // Keep default state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTag);
  }, [fetchData, activeTag]);

  useEffect(() => {
    if (queryTag && TAG_OPTIONS.includes(queryTag as (typeof TAG_OPTIONS)[number])) {
      setActiveTag(queryTag);
    }
  }, [queryTag]);

  const visibleCards = promptFilter
    ? allCards.filter((card) => card.front === promptFilter)
    : recentCards;
  const visibleHistory = promptFilter
    ? reviewHistory.filter((entry) => entry.card_front === promptFilter)
    : reviewHistory;

  async function handleDelete(cardId: string) {
    if (deleting) return;
    setDeleting(cardId);
    try {
      const res = await fetch("/api/review-cards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: cardId }),
      });
      if (res.ok) {
        setRecentCards((prev) => prev.filter((c) => c.id !== cardId));
        setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch {
      // Silently fail
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20">
        <LoaderCircle className="size-5 animate-spin text-[var(--ink-soft)]" />
        <p className="text-sm text-[var(--ink-soft)]">Loading review data…</p>
      </div>
    );
  }

  if (promptFilter) {
    return (
      <div className="grid gap-5">
        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Writing prompt review</p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{promptFilter}</h2>
          {scenarioText ? (
            <div className="mt-5 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Scenario</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{scenarioText}</p>
            </div>
          ) : null}
          {taskText ? (
            <div className="mt-4 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Task</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{taskText}</p>
            </div>
          ) : null}
        </article>

        <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Past feedback</p>
          <h3 className="font-display mt-4 text-2xl tracking-tight text-[var(--ink)]">
            {visibleCards.length > 0 ? `All saved feedback for ${promptFilter}.` : "No saved feedback for this prompt yet."}
          </h3>
          {visibleCards.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {visibleCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4"
                >
                  <p className="text-sm leading-7 text-[var(--ink)]">{card.back}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              Save review tips for this prompt first, then all earlier feedback will appear here.
            </p>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Stats overview */}
      <ReviewStatsPanel stats={stats} />

      {/* Tag filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-[var(--ink-soft)]" />
        {TAG_OPTIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
              activeTag === tag
                ? "border-[#7b4b14] bg-[#7b4b14] text-white"
                : "border-[rgba(20,50,75,0.16)] bg-white/80 text-[var(--ink-soft)] hover:border-[#7b4b14] hover:text-[#7b4b14]"
            }`}
          >
            {tag === "general" ? "General" : tag}
          </button>
        ))}
      </div>

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
              {activeTag !== "All" ? ` · ${activeTag}` : ""}
            </p>
            <h2 className="font-display mt-4 text-2xl tracking-tight text-[var(--ink)]">
              {visibleCards.length > 0
                ? promptFilter
                  ? `Review saved for ${promptFilter}.`
                  : "Recently added to your deck."
                : promptFilter
                  ? "No review saved for this prompt yet."
                  : "No cards in your deck yet."}
            </h2>
            {visibleCards.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {visibleCards.map((card) => (
                  <div
                    key={card.id}
                    className="group rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--ink)]">{card.front}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)] line-clamp-2">{card.back}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagStyle[card.tag] ?? tagStyle.general}`}
                        >
                          {card.tag}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(card.id)}
                          disabled={deleting === card.id}
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-transparent text-[var(--ink-soft)] opacity-0 transition-all hover:border-red-200 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
                          aria-label={`Delete ${card.front}`}
                        >
                          {deleting === card.id ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      </div>
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
                {promptFilter
                  ? "Save review tips for this writing prompt first, then they will appear here."
                  : activeTag !== "All"
                    ? `No ${activeTag} cards yet. Add vocabulary from ${activeTag.toLowerCase()} exercises.`
                    : "Add vocabulary from reading articles (select words while reading) or from feedback sessions (speaking, writing, reading). Cards you add will appear here and in your review sessions."}
              </p>
            )}
          </article>

          {/* Recent review history */}
          <article className="surface-panel reveal-up rounded-[2rem] p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[var(--ink-soft)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                Recent reviews
              </p>
            </div>
            {visibleHistory.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {visibleHistory.map((entry) => {
                  const label = ratingLabel[entry.rating] ?? { text: `${entry.rating}`, color: "text-[var(--ink)]" };
                  const timeAgo = formatTimeAgo(entry.reviewed_at);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-white/60 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--ink)]">{entry.card_front}</p>
                        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{timeAgo}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold ${label.color}`}>{label.text}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                {promptFilter
                  ? "No review history for this writing prompt yet."
                  : "No review history yet. Complete a review session to see your activity here."}
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

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
