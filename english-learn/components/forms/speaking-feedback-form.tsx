"use client";

import { ArrowRight, LoaderCircle, Mic, Waves } from "lucide-react";
import { useState } from "react";

import type { SpeakingFeedback } from "@/types/learning";

const defaultPrompt = "In one minute, explain how a university should support students who are learning through English.";

export function SpeakingFeedbackForm({ defaultLevel = "B1" }: { defaultLevel?: "A1" | "A2" | "B1" | "B2" }) {
  const [transcript, setTranscript] = useState(
    "Universities should support students by giving clearer instructions, more vocabulary help, and chances to practice discussion in small groups.",
  );
  const [targetLevel, setTargetLevel] = useState(defaultLevel);
  const [result, setResult] = useState<SpeakingFeedback | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai/feedback/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_level: targetLevel,
          transcript,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate speaking feedback.");
      }

      setResult(data);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to generate speaking feedback.";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel grid gap-5 rounded-[2rem] p-6 sm:p-7">
      <div>
        <p className="section-label">
          <Mic className="size-3.5" /> Speaking feedback
        </p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Evaluate clarity, fluency, and grammar together.</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">Use the transcript box as a stand-in for a recorded seminar response until audio upload is connected.</p>
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
          Transcript draft
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            className="min-h-36 rounded-[1.2rem] border border-[rgba(20,50,75,0.16)] bg-white/75 px-4 py-3 text-sm leading-7 outline-none"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || transcript.trim().length < 10}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isSubmitting ? "Analyzing response..." : "Get speaking feedback"}
      </button>

      {status ? <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">{status}</p> : null}

      {result ? (
        <div className="grid gap-4 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5">
          <div className="flex items-center gap-3 text-[var(--ink)]">
            <Waves className="size-4" />
            <p className="text-sm font-semibold">Feedback summary</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Pronunciation</p>
              <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.pronunciation_score}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Fluency</p>
              <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.fluency_score}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Grammar</p>
              <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.grammar_score}</p>
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
