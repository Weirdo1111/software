import { History, TrendingUp } from "lucide-react";

import { formatAttemptDate, formatSignedDelta } from "@/components/forms/speaking/formatters";
import type { SpeakingAttemptRecord } from "@/types/learning";

function summarizeTranscript(transcript: string) {
  const normalized = transcript.replace(/\s+/g, " ").trim();
  if (normalized.length <= 150) return normalized;
  return `${normalized.slice(0, 150)}...`;
}

// Date: 2026/3/18
// Author: Tianbo Cao
// Added a speaking history panel so each prompt can show first-take versus revised-take progress in one place.
export function SpeakingHistoryPanel({
  attempts,
  selectedPromptId,
  selectedPromptTitle,
  onLoadTranscript,
}: {
  attempts: SpeakingAttemptRecord[];
  selectedPromptId: string;
  selectedPromptTitle: string;
  onLoadTranscript: (transcript: string) => void;
}) {
  const promptAttempts = attempts.filter((attempt) => attempt.prompt_id === selectedPromptId);
  const latestAttempt = promptAttempts[0];
  const firstAttempt = promptAttempts[promptAttempts.length - 1];
  const hasComparison = promptAttempts.length >= 2 && latestAttempt && firstAttempt;

  return (
    <div className="rounded-[1.45rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
      <div className="flex items-start gap-3 text-[var(--ink)]">
        <History className="mt-0.5 size-4" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Speaking history</p>
          <p className="mt-2 text-base font-semibold text-[var(--ink)]">Compare earlier and later takes for this prompt.</p>
        </div>
      </div>

      {promptAttempts.length === 0 ? (
        <div className="mt-3 rounded-[1rem] bg-[rgba(20,50,75,0.04)] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
          No scored attempts yet for <span className="font-semibold text-[var(--ink)]">{selectedPromptTitle}</span>.
          Score one response to start tracking revisions here.
        </div>
      ) : null}

      {hasComparison ? (
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-2 text-[var(--ink)]">
            <TrendingUp className="size-4" />
            <p className="text-sm font-semibold">First take vs latest take</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.05rem] bg-white/88 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">First take</p>
              <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{firstAttempt.overall_score}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">{formatAttemptDate(firstAttempt.created_at)}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{summarizeTranscript(firstAttempt.transcript)}</p>
              <button
                type="button"
                onClick={() => onLoadTranscript(firstAttempt.transcript)}
                className="mt-4 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
              >
                Load first take
              </button>
            </div>

            <div className="rounded-[1.05rem] bg-white/88 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Latest take</p>
              <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{latestAttempt.overall_score}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">{formatAttemptDate(latestAttempt.created_at)}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{summarizeTranscript(latestAttempt.transcript)}</p>
              <button
                type="button"
                onClick={() => onLoadTranscript(latestAttempt.transcript)}
                className="mt-4 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
              >
                Load latest take
              </button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(237,246,241,0.92)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#47685f]">Overall delta</p>
              <p className="mt-2 text-sm font-semibold text-[#1a493f]">
                {formatSignedDelta(latestAttempt.overall_score - firstAttempt.overall_score)}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(237,245,251,0.92)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#48606f]">Task delta</p>
              <p className="mt-2 text-sm font-semibold text-[var(--navy)]">
                {formatSignedDelta(latestAttempt.task_response_score - firstAttempt.task_response_score)}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,249,241,0.96)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8d6229]">Draft delta</p>
              <p className="mt-2 text-sm font-semibold text-[#7b4b14]">
                {formatSignedDelta(
                  latestAttempt.transcript.trim().split(/\s+/).filter(Boolean).length -
                    firstAttempt.transcript.trim().split(/\s+/).filter(Boolean).length,
                )}{" "}
                words
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {promptAttempts.length > 0 ? (
        <div className="mt-4 grid gap-2">
          <p className="text-sm font-semibold text-[var(--ink)]">Recent scored attempts for this prompt</p>
          {promptAttempts.slice(0, 3).map((attempt) => (
            <div
              key={attempt.id}
              className="rounded-[1rem] border border-[rgba(20,50,75,0.08)] bg-white/82 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    Overall {attempt.overall_score} • Task {attempt.task_response_score}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    {formatAttemptDate(attempt.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onLoadTranscript(attempt.transcript)}
                  className="rounded-full border border-[rgba(20,50,75,0.16)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
                >
                  Load draft
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
