import type { RecorderStatus, SpeakingAudioClip } from "@/components/forms/speaking/types";
import type { SpeakingPrompt } from "@/types/learning";

function getRecorderSummary(status: RecorderStatus, audioClip: SpeakingAudioClip | null, isRecorderSupported: boolean) {
  if (!isRecorderSupported) return "Recorder unavailable";
  if (status === "recording") return "Recording in progress";
  if (status === "paused") return "Recording paused";
  if (audioClip) return "Audio take saved";
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
  isRecorderSupported,
}: {
  selectedPrompt: SpeakingPrompt;
  transcript: string;
  recorderStatus: RecorderStatus;
  audioClip: SpeakingAudioClip | null;
  isRecorderSupported: boolean;
}) {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Active task</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{selectedPrompt.title}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{selectedPrompt.prompt}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)] xl:max-w-[48%] xl:justify-end">
          <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1.5">{selectedPrompt.major_label}</span>
          <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1.5">{selectedPrompt.category_label}</span>
          <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1.5">{selectedPrompt.response_time_sec}s</span>
          <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1.5">{wordCount} words</span>
          <span className="rounded-full bg-[rgba(20,50,75,0.05)] px-3 py-1.5">
            {getRecorderSummary(recorderStatus, audioClip, isRecorderSupported)}
          </span>
        </div>
      </div>
    </div>
  );
}
