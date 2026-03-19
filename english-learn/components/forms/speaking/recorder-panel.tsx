import { Mic, Pause, RotateCcw, Square, Waves } from "lucide-react";

import { formatRecordingTime } from "@/components/forms/speaking/formatters";
import type { RecorderStatus, SpeakingAudioClip } from "@/components/forms/speaking/types";

function formatClipSize(blob: Blob) {
  if (blob.size < 1024 * 1024) {
    return `${Math.max(1, Math.round(blob.size / 1024))} KB`;
  }

  return `${(blob.size / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusLabel(status: RecorderStatus, isSupported: boolean) {
  if (!isSupported) {
    return "Microphone not supported";
  }

  switch (status) {
    case "recording":
      return "Recording live";
    case "paused":
      return "Paused";
    case "stopped":
      return "Take saved";
    case "error":
      return "Recorder error";
    default:
      return "Ready to record";
  }
}

// Date: 2026/3/18
// Author: Tianbo Cao
// Reduced the recorder UI to the controls and status signals the learner needs during one speaking take.
export function SpeakingRecorderPanel({
  status,
  error,
  elapsedMs,
  audioLevel,
  audioClip,
  isSupported,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}: {
  status: RecorderStatus;
  error: string;
  elapsedMs: number;
  audioLevel: number;
  audioClip: SpeakingAudioClip | null;
  isSupported: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}) {
  const isRecording = status === "recording";
  const isPaused = status === "paused";
  const levelWidth = `${Math.max(6, Math.round(audioLevel * 100))}%`;

  return (
    <div className="rounded-[1.6rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.76)] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Recorder</p>
          <p className="mt-3 text-lg font-semibold text-[var(--ink)]">Record one full take.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">The clip stays in your browser and can be reviewed before scoring.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
            !isSupported
              ? "bg-[rgba(20,50,75,0.06)] text-[var(--ink-soft)]"
              : isRecording
              ? "bg-[rgba(195,109,89,0.12)] text-[var(--coral)]"
              : isPaused
                ? "bg-[rgba(216,142,52,0.12)] text-[#9b661f]"
                : "bg-[rgba(20,50,75,0.06)] text-[var(--ink-soft)]"
          }`}
        >
          {getStatusLabel(status, isSupported)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-[1.9rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(20,50,75,0.04)]">
          <Mic className={`size-8 ${isRecording ? "text-[var(--coral)]" : "text-[var(--navy)]"}`} />
          <p className="mt-3 font-display text-2xl tracking-tight text-[var(--ink)]">{formatRecordingTime(elapsedMs)}</p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.08)] bg-white/84 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Live mic level</p>
              <p className="text-xs text-[var(--ink-soft)]">{isRecording ? "Listening..." : "Waiting"}</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[rgba(20,50,75,0.08)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2a6958] via-[#d88e34] to-[#c36d59] transition-all duration-150"
                style={{ width: levelWidth }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={!isSupported || isRecording || isPaused}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Mic className="size-4" /> Start recording
        </button>
        <button
          type="button"
          onClick={onPause}
          disabled={!isRecording}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Pause className="size-4" /> Pause
        </button>
        <button
          type="button"
          onClick={onResume}
          disabled={!isPaused}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Waves className="size-4" /> Resume
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!isRecording && !isPaused}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(195,109,89,0.2)] bg-[rgba(255,244,240,0.92)] px-4 py-2.5 text-sm font-semibold text-[var(--coral)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Square className="size-4" /> Stop
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!audioClip && status === "idle"}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <RotateCcw className="size-4" /> Reset
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          {error}
        </p>
      ) : null}

      {!isSupported ? (
        <p className="mt-4 rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
          Microphone recording is not available in this browser environment.
        </p>
      ) : null}

      {audioClip ? (
        <div className="mt-5 rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Latest take</p>
              <p className="mt-2 text-sm text-[var(--ink)]">
                {formatRecordingTime(audioClip.durationMs)} • {formatClipSize(audioClip.blob)} • {audioClip.mimeType}
              </p>
            </div>
            <span className="rounded-full bg-[rgba(42,105,88,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2a6958]">
              Local preview ready
            </span>
          </div>
          <audio controls src={audioClip.url} className="mt-4 w-full" />
        </div>
      ) : null}
    </div>
  );
}
