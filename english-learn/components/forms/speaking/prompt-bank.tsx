import { RefreshCcw, Sparkles } from "lucide-react";

import type { SpeakingLevel } from "@/components/forms/speaking/types";
import type { SpeakingPrompt } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Reduced the prompt bank to the minimum context needed before the learner starts recording.
export function SpeakingPromptBank({
  targetLevel,
  availablePrompts,
  selectedPrompt,
  onTargetLevelChange,
  onPromptChange,
  onLoadSample,
  onResetPractice,
}: {
  targetLevel: SpeakingLevel;
  availablePrompts: SpeakingPrompt[];
  selectedPrompt: SpeakingPrompt;
  onTargetLevelChange: (level: SpeakingLevel) => void;
  onPromptChange: (promptId: string) => void;
  onLoadSample: () => void;
  onResetPractice: () => void;
}) {
  return (
    <div className="grid gap-4 rounded-[1.65rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Prompt bank</p>
          <h3 className="font-display mt-3 text-2xl tracking-tight text-[var(--ink)]">Choose one speaking task.</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Keep one prompt active, then move straight into recording and revision.</p>
        </div>

        <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
          Target level
          <select
            value={targetLevel}
            onChange={(event) => onTargetLevelChange(event.target.value as SpeakingLevel)}
            className="rounded-[1rem] border border-[rgba(20,50,75,0.16)] bg-white/88 px-4 py-3 text-sm outline-none"
          >
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {availablePrompts.map((prompt) => {
          const isActive = prompt.id === selectedPrompt.id;

          return (
            <button
              key={prompt.id}
              type="button"
              onClick={() => onPromptChange(prompt.id)}
              className={`grid gap-3 rounded-[1.3rem] border p-4 text-left transition-colors ${
                isActive
                  ? "border-[#7b4b14] bg-[#fff8ee] shadow-[0_14px_28px_rgba(123,75,20,0.08)]"
                  : "border-[rgba(20,50,75,0.12)] bg-white/84 hover:border-[#7b4b14] hover:bg-[#fff9f1]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{prompt.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">{prompt.scenario}</p>
                </div>
                <span className="rounded-full bg-[rgba(20,50,75,0.06)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                  {prompt.response_time_sec}s
                </span>
              </div>
              <p className="text-sm leading-6 text-[var(--ink-soft)]">{prompt.skill_focus}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 rounded-[1.35rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(248,250,252,0.74)] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Active prompt</p>
            <h4 className="mt-2 text-lg font-semibold text-[var(--ink)]">{selectedPrompt.title}</h4>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)]">{selectedPrompt.prompt}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[rgba(123,75,20,0.1)] px-3 py-1 text-xs font-semibold text-[#7b4b14]">
              {selectedPrompt.level}
            </span>
            <span className="rounded-full bg-[rgba(20,50,75,0.06)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
              {selectedPrompt.partner_role}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedPrompt.useful_phrases.map((phrase) => (
            <span
              key={phrase}
              className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white/84 px-3 py-1.5 text-sm text-[var(--ink)]"
            >
              {phrase}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/88 px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
          >
            <Sparkles className="size-4" /> Load sample opening
          </button>
          <button
            type="button"
            onClick={onResetPractice}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/88 px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[#7b4b14] hover:text-[#7b4b14]"
          >
            <RefreshCcw className="size-4" /> Reset practice
          </button>
        </div>
      </div>
    </div>
  );
}
