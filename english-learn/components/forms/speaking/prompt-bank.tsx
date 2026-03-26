<<<<<<< Updated upstream
import { RefreshCcw, Sparkles } from "lucide-react";

import type { SpeakingLevel } from "@/components/forms/speaking/types";
import type { SpeakingPrompt } from "@/types/learning";
=======
import { speakingDifficultyOptions, speakingPromptMajors, speakingScenarioOptions } from "@/lib/speaking-prompts";
import type { SpeakingScenarioFilter } from "@/components/forms/speaking/types";
import type { DIICSUMajorId, SpeakingDifficulty, SpeakingPrompt } from "@/types/learning";
>>>>>>> Stashed changes

// Date: 2026/3/18
// Author: Tianbo Cao
// Reduced the prompt bank to the minimum context needed before the learner starts recording.
export function SpeakingPromptBank({
  selectedMajorId,
  targetLevel,
  selectedCategory,
  availablePrompts,
  selectedPrompt,
  onMajorChange,
  onTargetLevelChange,
  onCategoryChange,
  onPromptChange,
  onLoadSample,
  onResetPractice,
}: {
  selectedMajorId: DIICSUMajorId;
  targetLevel: SpeakingDifficulty;
  selectedCategory: SpeakingScenarioFilter;
  availablePrompts: SpeakingPrompt[];
  selectedPrompt: SpeakingPrompt;
  onMajorChange: (majorId: DIICSUMajorId) => void;
  onTargetLevelChange: (level: SpeakingDifficulty) => void;
  onCategoryChange: (category: SpeakingScenarioFilter) => void;
  onPromptChange: (promptId: string) => void;
  onLoadSample: () => void;
  onResetPractice: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-[1.45rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-4">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Prompt bank</p>
          <p className="text-xs text-[var(--ink-soft)]">{availablePrompts.length} tasks</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {speakingPromptMajors.map((major) => {
            const isActive = major.id === selectedMajorId;

            return (
              <button
                key={major.id}
                type="button"
                onClick={() => onMajorChange(major.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                    : "border-[rgba(20,50,75,0.12)] bg-white/88 text-[var(--ink)] hover:border-[var(--navy)]"
                }`}
              >
                {major.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {speakingDifficultyOptions.map((option) => {
            const isActive = option.id === targetLevel;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onTargetLevelChange(option.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-[#7b4b14] bg-[#fff4e4] text-[#7b4b14]"
                    : "border-[rgba(20,50,75,0.12)] bg-white/88 text-[var(--ink)] hover:border-[#7b4b14]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              selectedCategory === "all"
                ? "border-[#1a493f] bg-[#edf6f1] text-[#1a493f]"
                : "border-[rgba(20,50,75,0.12)] bg-white/88 text-[var(--ink)] hover:border-[#1a493f]"
            }`}
          >
            All scenarios
          </button>
          {speakingScenarioOptions.map((option) => {
            const isActive = option.id === selectedCategory;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onCategoryChange(option.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-[#1a493f] bg-[#edf6f1] text-[#1a493f]"
                    : "border-[rgba(20,50,75,0.12)] bg-white/88 text-[var(--ink)] hover:border-[#1a493f]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {availablePrompts.length > 0 ? (
        <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {availablePrompts.map((prompt) => {
            const isActive = prompt.id === selectedPrompt.id;

            return (
              <button
                key={prompt.id}
                type="button"
                onClick={() => onPromptChange(prompt.id)}
                className={`flex items-center justify-between gap-3 rounded-[1.05rem] border px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "border-[#7b4b14] bg-[#fff8ee]"
                    : "border-[rgba(20,50,75,0.12)] bg-white/84 hover:border-[#7b4b14] hover:bg-[#fff9f1]"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">{prompt.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    {prompt.category_label} • {prompt.scenario}
                  </p>
                </div>
<<<<<<< Updated upstream
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
=======
                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-[rgba(20,50,75,0.06)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {prompt.response_time_sec}s
                  </span>
                  <div>
                    <span className="mt-2 block text-xs text-[var(--ink-soft)]">{prompt.major_label}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.2rem] border border-dashed border-[rgba(20,50,75,0.18)] bg-[rgba(255,255,255,0.68)] px-4 py-4 text-sm leading-6 text-[var(--ink-soft)]">
          No speaking task matches this filter yet. Switch the scenario chip or pick another major or difficulty band.
        </div>
      )}
>>>>>>> Stashed changes
    </div>
  );
}
