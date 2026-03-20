import { Sparkles, Waves } from "lucide-react";

import type { SpeakingFeedback } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Simplified score rendering so the post-submission view stays focused on the next revision step.
export function SpeakingScorePanel({
  result,
  onUseSampleUpgrade,
}: {
  result: SpeakingFeedback;
  onUseSampleUpgrade?: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 rounded-[1.7rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.74)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[var(--ink)]">
        <div className="flex items-center gap-3">
          <Waves className="size-4" />
          <p className="text-sm font-semibold">Scoring summary</p>
        </div>
        <div className="rounded-full bg-[rgba(20,50,75,0.05)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">
          Overall {result.overall_score}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.25rem] bg-white/84 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Task</p>
          <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.task_response_score}</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/84 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Pronunciation</p>
          <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.pronunciation_score}</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/84 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Fluency</p>
          <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.fluency_score}</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/84 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Grammar</p>
          <p className="font-display mt-2 text-3xl tracking-tight text-[var(--ink)]">{result.grammar_score}</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.2rem] bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Strengths</p>
          <div className="mt-3 grid gap-2">
            {result.strengths.map((strength) => (
              <div key={strength} className="rounded-[0.95rem] bg-[rgba(237,246,241,0.95)] px-3 py-2 text-sm text-[#1a493f]">
                {strength}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.2rem] bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Revision focus</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{result.revision_focus}</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[1.2rem] bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Delivery snapshot</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{result.delivery_snapshot}</p>
        </div>
        <div className="rounded-[1.2rem] bg-white/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">AI upgraded sample</p>
            {onUseSampleUpgrade ? (
              <button
                type="button"
                onClick={() => onUseSampleUpgrade(result.sample_upgrade)}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/88 px-3 py-2 text-xs font-semibold text-[var(--ink)]"
              >
                <Sparkles className="size-3.5" /> Use as draft
              </button>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{result.sample_upgrade}</p>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-[var(--ink)]">AI practice tips</p>
        {result.tips.map((tip) => (
          <div key={tip} className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
