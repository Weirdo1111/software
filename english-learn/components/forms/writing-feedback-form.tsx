"use client";

import { ArrowRight, FilePenLine, LoaderCircle, WandSparkles } from "lucide-react";
import { useState } from "react";

import type { WritingFeedback } from "@/types/learning";

const defaultPrompt = "Write a short analytical paragraph explaining one challenge international students face in academic reading and one practical solution.";

export function WritingFeedbackForm({ defaultLevel = "B1" }: { defaultLevel?: "A1" | "A2" | "B1" | "B2" }) {
  const [essay, setEssay] = useState(
    "International students often struggle with academic reading because texts include many unfamiliar words and long sentences. A practical solution is to teach them how to identify key terms, mark topic sentences, and build a small subject-specific vocabulary list before class.",
  );
  const [targetLevel, setTargetLevel] = useState(defaultLevel);
  const [result, setResult] = useState<WritingFeedback | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai/feedback/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay_text: essay,
          target_level: targetLevel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate writing feedback.");
      }

      setResult(data);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to generate writing feedback.";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-7">
      <div>
        <p className="section-label">
          <FilePenLine className="size-3.5" /> Writing feedback
        </p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Check idea control, language accuracy, and revision quality.</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">This form is positioned as an academic writing lab rather than a generic grammar checker.</p>
      </div>

      <div className="rounded-[1.4rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Prompt</p>
        <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{defaultPrompt}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
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
        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Draft paragraph
          <textarea
            value={essay}
            onChange={(event) => setEssay(event.target.value)}
            className="min-h-40 rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm leading-7 outline-none"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || essay.trim().length < 20}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isSubmitting ? "Analyzing draft..." : "Get writing feedback"}
      </button>

      {status ? <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">{status}</p> : null}

      {result ? (
        <div className="grid gap-4 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
          <div className="flex items-center gap-3 text-[var(--ink)]">
            <WandSparkles className="size-4" />
            <p className="text-sm font-semibold">Revision guidance</p>
          </div>
          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Overall score</p>
            <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.overall_score}</p>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-[var(--ink)]">Priority fixes</p>
            {result.errors.map((error) => (
              <div key={error} className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                {error}
              </div>
            ))}
          </div>
          <div className="rounded-[1.2rem] bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Rewrite sample</p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{result.rewrite_sample}</p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
