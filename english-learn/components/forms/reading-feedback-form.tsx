"use client";

import { ArrowRight, BookMarked, BookOpen, LoaderCircle } from "lucide-react";
import { useState } from "react";

import type { ReadingFeedback } from "@/types/learning";

const PASSAGE = [
  "Remote learning has reshaped how first-year students interact with academic texts. A survey conducted across five Chinese universities found that students studying from home complete more assigned readings than their campus-based peers. The central claim is clear: independent reading frequency increases under remote conditions, yet comprehension depth declines when collaborative discussion is removed from the process.",
  "Proponents of fully online study argue that self-paced access to digital materials improves reading coverage. However, longitudinal data from the same survey shows that students without weekly seminar discussion produce shorter and less evidence-based written responses after eight weeks. One concrete example is the drop in referencing accuracy seen in remote cohorts compared to blended-learning groups.",
  "For new university students, terms such as longitudinal, cohort, blended learning, and evidence-based appear regularly in academic source material and are worth adding to a personal vocabulary review system.",
];

const VOCAB_OPTIONS = ["longitudinal", "cohort", "blended learning", "evidence-based", "referencing accuracy"];

const MAX_VOCAB = 2;

export function ReadingFeedbackForm({ defaultLevel = "B1" }: { defaultLevel?: "A1" | "A2" | "B1" | "B2" }) {
  const [targetLevel, setTargetLevel] = useState(defaultLevel);
  const [claim, setClaim] = useState(
    "independent reading frequency increases under remote conditions, yet comprehension depth declines when collaborative discussion is removed",
  );
  const [evidence, setEvidence] = useState(
    "students without weekly seminar discussion produce shorter and less evidence-based written responses after eight weeks",
  );
  const [contrastSignal, setContrastSignal] = useState("However");
  const [selectedVocab, setSelectedVocab] = useState<string[]>([]);
  const [result, setResult] = useState<ReadingFeedback | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleVocab(word: string) {
    setSelectedVocab((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= MAX_VOCAB) return prev;
      return [...prev, word];
    });
  }

  const isReady = claim.trim().length > 5 && evidence.trim().length > 5 && contrastSignal.trim().length > 0;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai/feedback/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage: PASSAGE.join("\n\n"),
          answers: {
            claim,
            evidence,
            contrast_signal: contrastSignal,
            vocabulary: selectedVocab,
          },
          target_level: targetLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate reading feedback.");
      }

      setResult(data);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to generate reading feedback.";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-7">
      <div>
        <p className="section-label">
          <BookOpen className="size-3.5" /> Reading feedback
        </p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          Identify the claim, locate evidence, and build vocabulary.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
          Read the passage below, then answer the three comprehension questions and select up to two academic terms to
          add to your review deck.
        </p>
      </div>

      {/* Passage */}
      <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Passage</p>
        <div className="mt-3 grid gap-4">
          {PASSAGE.map((paragraph, index) => (
            <p key={index} className="text-sm leading-8 text-[var(--ink)]">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Level selector */}
      <label className="grid w-fit gap-2 text-sm font-medium text-[var(--ink)]">
        Target level
        <select
          value={targetLevel}
          onChange={(event) => setTargetLevel(event.target.value as "A1" | "A2" | "B1" | "B2")}
          className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
        >
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
        </select>
      </label>

      {/* Checkpoint 1 */}
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Checkpoint 1 — What sentence expresses the main claim most clearly?
        <textarea
          value={claim}
          onChange={(event) => setClaim(event.target.value)}
          placeholder="Copy or paraphrase the sentence you think states the main claim."
          className="min-h-20 rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm leading-7 outline-none"
        />
      </label>

      {/* Checkpoint 2 */}
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Checkpoint 2 — Which detail functions as evidence rather than background?
        <textarea
          value={evidence}
          onChange={(event) => setEvidence(event.target.value)}
          placeholder="Identify the specific detail that directly supports the main claim."
          className="min-h-20 rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm leading-7 outline-none"
        />
      </label>

      {/* Checkpoint 3 */}
      <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
        Checkpoint 3 — What transition signals contrast in the passage?
        <input
          type="text"
          value={contrastSignal}
          onChange={(event) => setContrastSignal(event.target.value)}
          placeholder="e.g. However, Although, Yet…"
          className="rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm outline-none"
        />
      </label>

      {/* Vocabulary selector */}
      <div className="grid gap-3">
        <p className="text-sm font-medium text-[var(--ink)]">
          Vocabulary — Select up to {MAX_VOCAB} terms to add to your review deck
        </p>
        <div className="flex flex-wrap gap-2">
          {VOCAB_OPTIONS.map((word) => {
            const isSelected = selectedVocab.includes(word);
            const isDisabled = !isSelected && selectedVocab.length >= MAX_VOCAB;
            return (
              <button
                key={word}
                type="button"
                onClick={() => toggleVocab(word)}
                disabled={isDisabled}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-[#7b4b14] bg-[#7b4b14] text-white"
                    : isDisabled
                      ? "cursor-not-allowed border-[rgba(20,50,75,0.1)] bg-transparent text-[var(--ink-soft)] opacity-40"
                      : "border-[rgba(20,50,75,0.2)] bg-white/75 text-[var(--ink)] hover:border-[#7b4b14] hover:text-[#7b4b14]"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !isReady}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isSubmitting ? "Analyzing answers…" : "Get reading feedback"}
      </button>

      {/* Error */}
      {status ? (
        <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          {status}
        </p>
      ) : null}

      {/* Result */}
      {result ? (
        <div className="grid gap-4 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
          <div className="flex items-center gap-3 text-[var(--ink)]">
            <BookMarked className="size-4" />
            <p className="text-sm font-semibold">Comprehension feedback</p>
          </div>

          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Comprehension score
            </p>
            <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">
              {result.comprehension_score}
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Claim</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{result.claim_feedback}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Evidence</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{result.evidence_feedback}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Vocabulary</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{result.vocabulary_feedback}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-semibold text-[var(--ink)]">Coach tips</p>
            {result.tips.map((tip) => (
              <div key={tip} className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                {tip}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
