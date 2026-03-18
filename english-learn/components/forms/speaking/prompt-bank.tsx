import { RefreshCcw, Sparkles } from "lucide-react";

import type { SpeakingLevel } from "@/components/forms/speaking/types";
import type { SpeakingPrompt } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Refined the prompt bank layout so selection, context, and current-task details feel more intentional and readable.
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
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Prompt bank</p>
            <h3 className="font-display mt-3 text-2xl tracking-tight text-[var(--ink)]">
              Choose an academic speaking situation before you rehearse.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
              Each prompt is framed around a seminar, tutorial, or campus communication setting so your speaking
              practice stays close to real university tasks.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
            <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
              Target level
              <select
                value={targetLevel}
                onChange={(event) => onTargetLevelChange(event.target.value as SpeakingLevel)}
                className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white/85 px-4 py-3 text-sm outline-none"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
              </select>
            </label>

            <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.1)] bg-[rgba(20,50,75,0.04)] px-4 py-3 text-sm text-[var(--ink-soft)]">
              {availablePrompts.length} prompt{availablePrompts.length === 1 ? "" : "s"} available for this band
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {availablePrompts.map((prompt) => {
            const isActive = prompt.id === selectedPrompt.id;

            return (
              <button
                key={prompt.id}
                type="button"
                onClick={() => onPromptChange(prompt.id)}
                className={`grid min-h-40 gap-3 rounded-[1.4rem] border p-4 text-left transition-colors ${
                  isActive
                    ? "border-[#7b4b14] bg-[#fff8ee] shadow-[0_18px_32px_rgba(123,75,20,0.08)]"
                    : "border-[rgba(20,50,75,0.12)] bg-white/82 hover:border-[#7b4b14] hover:bg-[#fff9f1]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold text-[var(--ink)]">{prompt.title}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                      {prompt.scenario}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      isActive
                        ? "bg-[rgba(123,75,20,0.1)] text-[#7b4b14]"
                        : "bg-[rgba(20,50,75,0.06)] text-[var(--ink-soft)]"
                    }`}
                  >
                    {prompt.level}
                  </span>
                </div>

                <p className="text-sm leading-6 text-[var(--ink-soft)]">{prompt.skill_focus}</p>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {prompt.response_time_sec}s target
                  </span>
                  <span className="rounded-full bg-[rgba(42,105,88,0.08)] px-3 py-1 text-xs font-semibold text-[#2a6958]">
                    {prompt.partner_role}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.7rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.78)] shadow-[0_20px_45px_rgba(23,32,51,0.06)]">
        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="bg-gradient-to-br from-[rgba(255,249,241,0.96)] via-[rgba(255,255,255,0.9)] to-[rgba(247,239,227,0.9)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Selected prompt</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">{selectedPrompt.title}</h3>
              </div>
              <span className="rounded-full bg-[rgba(123,75,20,0.1)] px-3 py-1 text-xs font-semibold text-[#7b4b14]">
                {selectedPrompt.response_time_sec}s response
              </span>
            </div>

            <p className="mt-4 text-base leading-8 text-[var(--ink)]">{selectedPrompt.prompt}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.08)] bg-white/86 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Skill focus</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink)]">{selectedPrompt.skill_focus}</p>
              </div>
              <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.08)] bg-white/86 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">AI partner role</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
                  {selectedPrompt.partner_role} with the goal of {selectedPrompt.partner_goal}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
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
                <RefreshCcw className="size-4" /> Reset this practice set
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[rgba(20,50,75,0.08)] bg-[rgba(248,250,252,0.74)] p-5 sm:p-6 lg:border-t-0 lg:border-l">
            <div className="rounded-[1.2rem] bg-white/88 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Useful phrases</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPrompt.useful_phrases.map((phrase) => (
                  <span
                    key={phrase}
                    className="rounded-full border border-[rgba(20,50,75,0.12)] bg-[rgba(247,239,227,0.9)] px-3 py-1.5 text-sm text-[var(--ink)]"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.2rem] bg-white/88 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Response checkpoints</p>
              <div className="mt-3 grid gap-2">
                {selectedPrompt.checkpoints.map((checkpoint, index) => (
                  <div
                    key={checkpoint}
                    className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-[0.95rem] bg-[rgba(20,50,75,0.04)] px-3 py-3 text-sm text-[var(--ink-soft)]"
                  >
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--navy)] text-xs font-semibold text-[#f7efe3]">
                      {index + 1}
                    </span>
                    <span>{checkpoint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
