import type { RecorderStatus, SpeakingAudioClip } from "@/components/forms/speaking/types";
import type { SpeakingPrompt } from "@/types/learning";

function getRecorderSummary(status: RecorderStatus, audioClip: SpeakingAudioClip | null) {
  if (status === "recording") return "Recording in progress";
  if (status === "paused") return "Recording paused";
  if (audioClip) return "Audio take saved";
  if (status === "unsupported") return "Recorder unavailable";
  if (status === "error") return "Recorder needs attention";
  return "Recorder ready";
}

// Date: 2026/3/18
// Author: Tianbo Cao
// Added a compact status strip so the speaking layout surfaces the current task state without changing the visual language.
export function SpeakingOverviewStrip({
  selectedPrompt,
  transcript,
  recorderStatus,
  audioClip,
}: {
  selectedPrompt: SpeakingPrompt;
  transcript: string;
  recorderStatus: RecorderStatus;
  audioClip: SpeakingAudioClip | null;
}) {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Prompt pace</p>
        <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{selectedPrompt.response_time_sec} seconds target</p>
        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{selectedPrompt.scenario}</p>
      </div>
      <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Recorder</p>
        <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{getRecorderSummary(recorderStatus, audioClip)}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
          {audioClip ? "A speaking take is ready for review." : "Use one full take before scoring."}
        </p>
      </div>
      <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Draft length</p>
        <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{wordCount} words in the current scoring draft</p>
        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">Refine this version after recording or partner practice.</p>
      </div>
    </div>
  );
}
