"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, CheckCircle2, Compass, LoaderCircle, RefreshCcw, Send } from "lucide-react";

import { getDifficultyLabel } from "@/lib/level-labels";
import { cn } from "@/lib/utils";

interface PlacementQuestion {
  id: string;
  type: string;
  context?: string;
  prompt: string;
  options: string[];
  skill?: string;
  level?: string;
}

interface PlacementResult {
  cefr_level: string;
  band_label: string;
  score: number;
  total_questions: number;
  skill_breakdown: Record<string, number>;
  strongest_skill: string;
  weakest_skill: string;
  recommended_focus: string;
  summary: string;
}

const skillLabels: Record<string, string> = {
  listening: "Listening",
  speaking: "Speaking",
  reading: "Reading",
  writing: "Writing",
};

const choiceLabels = ["A", "B", "C", "D", "E", "F"];

function mapBand(level: string) {
  return getDifficultyLabel(level);
}

function normalizeBandLabel(label?: string) {
  if (!label) return "";
  const next = label.trim().toLowerCase();
  if (next === "low") return "Easy";
  if (next === "high") return "Difficult";
  if (next === "medium") return "Medium";
  return label;
}

function formatSkillName(skill: string) {
  return skillLabels[skill] ?? skill;
}

export function PlacementForm({ locale }: { locale: string }) {
  const [sessionId, setSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});

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
  const firstUnanswered = useMemo(() => questions.find((question) => answers[question.id] === undefined), [answers, questions]);
  const skillAnchors = useMemo(
    () =>
      questions.reduce<Record<string, string>>((accumulator, question) => {
        if (question.skill && !accumulator[question.skill]) {
          accumulator[question.skill] = question.id;
        }
        return accumulator;
      }, {}),
    [questions],
  );

  function scrollToQuestion(questionId?: string) {
    if (!questionId) {
      return;
    }

    questionRefs.current[questionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

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
          question_ids: questions.map((question) => question.id),
          answers: orderedAnswers,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submit failed.");
      }

      setResult({
        cefr_level: data.cefr_level,
        band_label: data.band_label,
        score: data.score,
        total_questions: data.total_questions,
        skill_breakdown: data.skill_breakdown ?? {},
        strongest_skill: data.strongest_skill,
        weakest_skill: data.weakest_skill,
        recommended_focus: data.recommended_focus,
        summary: data.summary,
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

        <div className="mt-6 grid gap-3">
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

        <div className="mt-5 grid gap-3">
          <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Quick actions</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollToQuestion(firstUnanswered?.id)}
                disabled={!firstUnanswered}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Compass className="size-4" /> {firstUnanswered ? "Jump to next unanswered" : "All answered"}
              </button>
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.08)]"
              >
                <ArrowUp className="size-4" /> Back to top
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(skillAnchors).map(([skill, questionId]) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => scrollToQuestion(questionId)}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(20,50,75,0.05)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgba(20,50,75,0.1)]"
                >
                  {formatSkillName(skill)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {questions.map((question, index) => (
          <article
            key={question.id}
            ref={(node) => {
              questionRefs.current[question.id] = node;
            }}
            className="rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.82)] p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                  Q{index + 1} • {skillLabels[question.skill ?? ""] ?? question.skill ?? "Assessment"}
                  {question.level ? ` • ${getDifficultyLabel(question.level)}` : ""}
                </p>
                {question.context ? (
                  <p className="mt-3 rounded-[1.1rem] bg-[rgba(20,50,75,0.06)] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                    {question.context}
                  </p>
                ) : null}
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
                      "grid gap-3 rounded-[1.2rem] border p-4 text-left transition",
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
        <div className="grid gap-4">
          <div>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">Submit once every question is answered. The result will map the learner to a banded academic pathway.</p>
            {error ? <p className="mt-2 text-sm font-semibold text-[var(--coral)]">{error}</p> : null}
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

          {result ? (
            <div className="rounded-[1.4rem] border border-[rgba(42,105,88,0.16)] bg-[rgba(237,246,241,0.88)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">Placement result</p>
              <h4 className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">
                {normalizeBandLabel(result.band_label) || mapBand(result.cefr_level)} • {mapBand(result.cefr_level)}
              </h4>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                Score: {result.score} / {result.total_questions || questions.length}. The dashboard and learning hub can now route this learner into a
                more suitable academic path.
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{result.summary}</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.1)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Strongest now</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{formatSkillName(result.strongest_skill)}</p>
                </div>
                <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.1)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Recommended focus</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{result.recommended_focus}</p>
                </div>
                {Object.entries(result.skill_breakdown).map(([skill, value]) => (
                  <div key={skill} className="rounded-[1.2rem] border border-[rgba(20,50,75,0.1)] bg-white/72 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{formatSkillName(skill)}</p>
                    <p className="font-display mt-2 text-2xl tracking-tight text-[var(--ink)]">{value}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">correct answers in this skill</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void start()}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-white"
                >
                  <RefreshCcw className="size-4" /> Retake test
                </button>
                <Link
                  href={`/dashboard?lang=${locale}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-white"
                >
                  Open dashboard
                </Link>
                <Link
                  href={`/learn?lang=${locale}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-[#f7efe3] transition hover:opacity-95"
                >
                  Go to learning hub
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
