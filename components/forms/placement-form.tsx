"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCcw, Send } from "lucide-react";

import { cn } from "@/lib/utils";

interface PlacementQuestion {
  id: string;
  prompt: string;
  options: string[];
  skill?: string;
  level?: string;
}

interface PlacementResult {
  cefr_level: string;
  score: number;
}

const skillLabels: Record<string, string> = {
  vocab: "Vocabulary",
  grammar: "Grammar",
  reading: "Reading",
  listening: "Listening",
};

const choiceLabels = ["A", "B", "C", "D", "E", "F"];

function mapBand(level: string) {
  if (["A1", "A2"].includes(level)) {
    return "Low";
  }

  if (level === "B1") {
    return "Medium";
  }

  return "High";
}

export function PlacementForm() {
  const [sessionId, setSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const start = useCallback(async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});

    try {
      const response = await fetch("/api/placement/start", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start placement test.");
      }

      setSessionId(data.test_session_id);
      setQuestions(data.questions ?? []);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to start placement test.";
      setError(message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void start();
  }, [start]);

  const answeredCount = Object.keys(answers).length;
  const completion = questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100);
  const canSubmit = useMemo(() => questions.length > 0 && answeredCount === questions.length, [answeredCount, questions.length]);

  async function submit() {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const orderedAnswers = questions.map((question) => answers[question.id] ?? -1);
      const response = await fetch("/api/placement/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_session_id: sessionId,
          answers: orderedAnswers,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submit failed.");
      }

      setResult({
        cefr_level: data.cefr_level,
        score: data.score,
      });
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Submit failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-6">
        <div className="flex items-center gap-3 text-sm font-semibold text-[var(--ink-soft)]">
          <LoaderCircle className="size-4 animate-spin" /> Preparing your assessment...
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-[1.8rem] border border-[rgba(195,109,89,0.28)] bg-[rgba(255,244,240,0.9)] p-6">
        <h3 className="font-display text-2xl tracking-tight text-[var(--ink)]">Placement test unavailable</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{error || "We could not load the test questions."}</p>
        <button
          type="button"
          onClick={() => void start()}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-[#f7efe3]"
        >
          <RefreshCcw className="size-4" /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.8)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Placement session</p>
            <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Complete every item to unlock your recommended path.</h3>
          </div>
          <button
            type="button"
            onClick={() => void start()}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]"
          >
            <RefreshCcw className="size-4" /> Restart
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Questions</p>
            <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{questions.length}</p>
          </div>
          <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Answered</p>
            <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{answeredCount}</p>
          </div>
          <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Completion</p>
            <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{completion}%</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(20,50,75,0.08)]">
          <div className="h-full rounded-full bg-[var(--navy)] progress-stripe transition-[width] duration-300" style={{ width: `${completion}%` }} />
        </div>
      </section>

      <div className="grid gap-4">
        {questions.map((question, index) => (
          <article key={question.id} className="rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.82)] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                  Q{index + 1} • {skillLabels[question.skill ?? ""] ?? question.skill ?? "Assessment"}
                  {question.level ? ` • ${question.level}` : ""}
                </p>
                <h4 className="mt-3 text-lg font-semibold leading-7 text-[var(--ink)]">{question.prompt}</h4>
              </div>
              {answers[question.id] !== undefined ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(42,105,88,0.18)] bg-[rgba(237,246,241,0.9)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                  <CheckCircle2 className="size-3.5" /> Answered
                </span>
              ) : null}
            </div>
            <div className="mt-5 grid gap-3">
              {question.options.map((option, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                const choiceLabel = choiceLabels[optionIndex] ?? String(optionIndex + 1);
                return (
                  <button
                    key={`${question.id}-${optionIndex}`}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                    className={cn(
                      "grid gap-3 rounded-[1.2rem] border p-4 text-left transition sm:grid-cols-[auto_1fr] sm:items-start",
                      selected
                        ? "border-[rgba(20,50,75,0.26)] bg-[rgba(20,50,75,0.08)] shadow-[0_12px_24px_rgba(20,50,75,0.08)]"
                        : "border-[rgba(20,50,75,0.12)] bg-white/70 hover:bg-[rgba(20,50,75,0.05)]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-full text-sm font-semibold",
                        selected ? "bg-[var(--navy)] text-[#f7efe3]" : "bg-[rgba(20,50,75,0.08)] text-[var(--ink)]",
                      )}
                    >
                      {choiceLabel}
                    </span>
                    <span className="text-sm leading-6 text-[var(--ink)]">{option}</span>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.84)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              Submit once every question is answered. The result will map the learner to a banded academic pathway.
            </p>
            {error ? <p className="mt-2 text-sm font-semibold text-[var(--coral)]">{error}</p> : null}
            {result ? (
              <div className="mt-4 rounded-[1.4rem] border border-[rgba(42,105,88,0.16)] bg-[rgba(237,246,241,0.88)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">Placement result</p>
                <h4 className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">
                  {mapBand(result.cefr_level)} band • {result.cefr_level}
                </h4>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Score: {result.score} / {questions.length}. The dashboard and learning hub can now route this learner into a more suitable academic path.
                </p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            {submitting ? "Submitting..." : "Submit placement"}
          </button>
        </div>
      </section>
    </div>
  );
}
