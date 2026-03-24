"use client";

import { Mic, PlayCircle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { useShadowingPractice } from "@/components/forms/listening/use-shadowing-practice";
import { useBrowserSpeech } from "@/components/forms/speaking/use-browser-speech";
import { scoreShadowingAttempt } from "@/lib/listening-materials";
import { cn } from "@/lib/utils";
import type { SpeakingPrompt } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Removed sentence-level navigation so shadowing stays focused on one active script at a time.
export function SpeakingShadowingPanel({
  prompt,
  transcriptSource,
}: {
  prompt: SpeakingPrompt;
  transcriptSource: string;
}) {
  const { playingId, playbackStatus, playMessage, stopPlayback } = useBrowserSpeech();
  const {
    isSupported: isShadowingSupported,
    status: shadowingStatus,
    transcript: shadowingTranscript,
    error: shadowingError,
    audioLevel,
    startListening,
    stopListening,
    resetListening,
  } = useShadowingPractice();

  const practiceScript = transcriptSource.trim() || prompt.sample_opening.trim();
  const scriptSourceLabel = transcriptSource.trim() ? "Current transcript" : "Prompt sample opening";
  const playbackKey = `${prompt.id}-shadowing-script`;
  const shadowingScore = shadowingTranscript.trim()
    ? scoreShadowingAttempt(practiceScript, shadowingTranscript)
    : null;

  useEffect(() => {
    resetListening();
    stopPlayback();
  }, [practiceScript, resetListening, stopPlayback]);

  function handleReplayTarget() {
    if (!practiceScript) return;
    playMessage(playbackKey, practiceScript);
  }

  function handleShadowingStart() {
    if (shadowingStatus === "listening") {
      stopListening();
      return;
    }

    startListening("en-GB", {
      continuous: true,
      stopOnSilence: false,
    });
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[linear-gradient(145deg,rgba(21,32,59,0.98),rgba(24,41,72,0.96))] p-5 text-[#f7efe3] shadow-[0_18px_48px_rgba(12,20,34,0.24)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-label border-white/12 bg-white/8 text-[#efe5d6]">Shadowing studio</p>
            <h3 className="font-display mt-4 text-3xl tracking-tight">Repeat the active script aloud.</h3>
            <p className="mt-3 text-sm leading-7 text-[#efe5d6]/82">
              Use your current speaking draft as the target. Record one shadowing attempt and compare the recognised words.
            </p>
          </div>
          <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#efe5d6]">
            {scriptSourceLabel}
          </span>
        </div>

        <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Target script</p>
          <p className="mt-2 text-sm leading-7 text-[#f7efe3]">
            {practiceScript || "Add a draft in Speaking studio first to create a shadowing target."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReplayTarget}
            disabled={!practiceScript}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlayCircle className="size-4" />
            {playingId === playbackKey ? "Playing sentence" : "Play Sentence"}
          </button>
          <button
            type="button"
            onClick={handleShadowingStart}
            disabled={!practiceScript || !isShadowingSupported}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50",
              shadowingStatus === "listening"
                ? "border border-[#f26b5e] bg-[#c74435] text-white shadow-[0_10px_24px_rgba(199,68,53,0.28)]"
                : "border border-white/12 bg-white/8 text-[#f7efe3]",
            )}
          >
            <Mic className="size-4" />
            {shadowingStatus === "listening" ? "Stop recording" : "Start shadowing"}
          </button>
          <button
            type="button"
            onClick={resetListening}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f7efe3]"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">dB</span>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#61a7ff] transition-[width] duration-100"
              style={{ width: `${Math.max(4, Math.round(audioLevel * 100))}%` }}
            />
          </div>
        </div>

        {shadowingStatus === "listening" ? (
          <p className="mt-4 rounded-[1rem] bg-[rgba(199,68,53,0.18)] px-4 py-3 text-sm font-semibold text-[#ffd7c9]">
            Recording now. Click the red button to stop.
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Your shadowing</p>
            <p className="mt-2 min-h-28 text-sm leading-7 text-[#f7efe3]">
              {shadowingTranscript || "Press Start shadowing and repeat the full target script aloud."}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Score</p>
            {shadowingScore ? (
              <>
                <p className="mt-2 text-4xl font-semibold text-[#f7efe3]">{shadowingScore.overallScore}%</p>
                <p className="mt-2 text-sm leading-7 text-[#efe5d6]/82">{shadowingScore.note}</p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-7 text-[#efe5d6]/82">
                The browser will compare your recognised keywords after one attempt.
              </p>
            )}
          </div>
        </div>

        {shadowingError ? (
          <p className="mt-4 rounded-[1rem] bg-[rgba(255,244,240,0.16)] px-4 py-3 text-sm font-medium text-[#ffd7c9]">
            {shadowingError}
          </p>
        ) : null}

        {!isShadowingSupported ? (
          <p className="mt-4 rounded-[1rem] bg-white/8 px-4 py-3 text-sm leading-7 text-[#efe5d6]/82">
            This browser does not expose speech recognition. You can still shadow manually with the target script and replay button.
          </p>
        ) : null}

        {playbackStatus ? (
          <p className="mt-4 rounded-[1rem] bg-white/8 px-4 py-3 text-sm leading-7 text-[#efe5d6]/82">
            {playbackStatus}
          </p>
        ) : null}

        {shadowingScore ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.15rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Matched</p>
              <p className="mt-2 text-sm leading-7 text-[#f7efe3]">{shadowingScore.matchedKeywords.join(", ") || "None yet"}</p>
            </div>
            <div className="rounded-[1.15rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Missing</p>
              <p className="mt-2 text-sm leading-7 text-[#f7efe3]">{shadowingScore.missingKeywords.join(", ") || "No major misses"}</p>
            </div>
            <div className="rounded-[1.15rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Extra</p>
              <p className="mt-2 text-sm leading-7 text-[#f7efe3]">{shadowingScore.extraKeywords.join(", ") || "None"}</p>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
