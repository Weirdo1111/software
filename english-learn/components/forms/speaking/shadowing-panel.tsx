"use client";

import {
  Mic,
  PlayCircle,
  RotateCcw,
  Target,
  Waves,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useShadowingPractice } from "@/components/forms/listening/use-shadowing-practice";
import { useBrowserSpeech } from "@/components/forms/speaking/use-browser-speech";
import {
  scoreShadowingAttempt,
  splitTranscriptIntoSentences,
} from "@/lib/listening-materials";
import { cn } from "@/lib/utils";
import type { SpeakingPrompt } from "@/types/learning";

type SpeakingSentenceSegment = {
  id: string;
  text: string;
};

function buildSpeakingSentenceSegments(sourceText: string, promptId: string): SpeakingSentenceSegment[] {
  return splitTranscriptIntoSentences(sourceText).map((sentence, index) => ({
    id: `${promptId}-shadowing-sentence-${index + 1}`,
    text: sentence,
  }));
}

export function SpeakingShadowingPanel({
  prompt,
  transcriptSource,
}: {
  prompt: SpeakingPrompt;
  transcriptSource: string;
}) {
  const {
    playingId,
    playbackStatus,
    playMessage,
    stopPlayback,
  } = useBrowserSpeech();
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

  const practiceScript = transcriptSource.trim() || prompt.sample_opening;
  const sentenceSegments = useMemo(
    () => buildSpeakingSentenceSegments(practiceScript, prompt.id),
    [practiceScript, prompt.id],
  );
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(0);
  const selectedSentence = sentenceSegments[selectedSentenceIndex] ?? null;
  const shadowingScore =
    selectedSentence && shadowingTranscript.trim()
      ? scoreShadowingAttempt(selectedSentence.text, shadowingTranscript)
      : null;
  const canUseSentenceTrainer = sentenceSegments.length > 0;

  // Reset when practice script changes — derive selectedSentenceIndex from key
  const [scriptKey, setScriptKey] = useState(practiceScript);
  if (scriptKey !== practiceScript) {
    setScriptKey(practiceScript);
    setSelectedSentenceIndex(0);
  }

  useEffect(() => {
    resetListening();
    stopPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally reset only when script changes
  }, [scriptKey]);

  useEffect(() => {
    resetListening();
  }, [resetListening, selectedSentenceIndex]);

  function handleSentencePlayback(index: number) {
    const sentence = sentenceSegments[index];
    if (!sentence) return;

    setSelectedSentenceIndex(index);
    playMessage(sentence.id, sentence.text);
  }

  function handleReplayTarget() {
    if (!selectedSentence) return;
    playMessage(selectedSentence.id, selectedSentence.text);
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
    <section className="grid gap-3">
      <article className="rounded-[1.45rem] border border-[rgba(20,50,75,0.12)] bg-[linear-gradient(145deg,rgba(21,32,59,0.98),rgba(24,41,72,0.96))] p-4 text-[#f7efe3] shadow-[0_18px_48px_rgba(12,20,34,0.24)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-label border-white/12 bg-white/8 text-[#efe5d6]">Shadowing studio</p>
            <h3 className="font-display mt-3 text-xl tracking-tight">Repeat the active script aloud.</h3>
          </div>
          <div className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {canUseSentenceTrainer ? "Active" : "Draft first"}
          </div>
        </div>

        <div className="mt-3 rounded-[1.1rem] border border-white/10 bg-white/6 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Target script</p>
          <p className="mt-2 max-h-32 overflow-y-auto pr-1 text-sm leading-6 text-[#f7efe3]">
            {practiceScript || "Add a draft in Speaking studio first to create a shadowing target."}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReplayTarget}
            disabled={!canUseSentenceTrainer || !selectedSentence}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlayCircle className="size-4" />
            Replay target
          </button>
          <button
            type="button"
            onClick={handleShadowingStart}
            disabled={!canUseSentenceTrainer || !isShadowingSupported}
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

        <div className="mt-3 flex items-center gap-3">
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

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.1rem] border border-white/10 bg-white/6 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Your shadowing</p>
            <p className="mt-2 min-h-24 text-sm leading-6 text-[#f7efe3]">
              {shadowingTranscript || "Press Start shadowing and repeat the full target script aloud."}
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-white/10 bg-white/6 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Score</p>
            {shadowingScore ? (
              <>
                <p className="mt-2 text-4xl font-semibold text-[#f7efe3]">{shadowingScore.overallScore}%</p>
                <p className="mt-2 text-sm leading-6 text-[#efe5d6]/82">{shadowingScore.note}</p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-[#efe5d6]/82">
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
            This browser does not expose speech recognition. You can still shadow manually with the target sentence and replay button.
          </p>
        ) : null}

        {playbackStatus ? (
          <p className="mt-4 rounded-[1rem] bg-white/8 px-4 py-3 text-sm leading-7 text-[#efe5d6]/82">
            {playbackStatus}
          </p>
        ) : null}

        {shadowingScore ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-white/10 bg-white/6 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Matched</p>
              <p className="mt-2 text-sm leading-6 text-[#f7efe3]">{shadowingScore.matchedKeywords.join(", ") || "None yet"}</p>
            </div>
            <div className="rounded-[1rem] border border-white/10 bg-white/6 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Missing</p>
              <p className="mt-2 text-sm leading-6 text-[#f7efe3]">{shadowingScore.missingKeywords.join(", ") || "No major misses"}</p>
            </div>
            <div className="rounded-[1rem] border border-white/10 bg-white/6 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">Extra</p>
              <p className="mt-2 text-sm leading-6 text-[#f7efe3]">{shadowingScore.extraKeywords.join(", ") || "None"}</p>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
