import type { DifficultyLabel } from "@/lib/level-labels";
import { difficultyOptions } from "@/lib/level-labels";
import type { SpeakingPrompt } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Reduced the prompt bank to the minimum context needed before the learner starts recording.
export function SpeakingPromptBank({
  targetDifficulty,
  availablePrompts,
  selectedPrompt,
  onTargetDifficultyChange,
  onPromptChange,
}: {
  targetDifficulty: DifficultyLabel;
  availablePrompts: SpeakingPrompt[];
  selectedPrompt: SpeakingPrompt;
  onTargetDifficultyChange: (difficulty: DifficultyLabel) => void;
  onPromptChange: (promptId: string) => void;
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
          Target difficulty
          <select
            value={targetDifficulty}
            onChange={(event) => onTargetDifficultyChange(event.target.value as DifficultyLabel)}
            className="rounded-[1rem] border border-[rgba(20,50,75,0.16)] bg-white/88 px-4 py-3 text-sm outline-none"
          >
            {difficultyOptions.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
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
    </div>
  );
}
