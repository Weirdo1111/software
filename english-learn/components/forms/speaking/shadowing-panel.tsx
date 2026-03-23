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
    <section className="grid gap-5 xl:grid-cols-[1fr_0.98fr]">
      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.84)] p-5 shadow-[0_18px_48px_rgba(18,32,52,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-label">
              <Waves className="size-3.5" /> Sentence trainer
            </p>
            <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
              Practice one speaking sentence at a time.
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              This trainer uses your current Transcript as the source script, so you can shadow the exact answer you are building.
            </p>
          </div>
          <div className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {canUseSentenceTrainer ? "Active" : "Draft first"}
          </div>
        </div>

        {canUseSentenceTrainer ? (
          <div className="mt-5 grid max-h-[36rem] gap-3 overflow-y-auto pr-1">
            {sentenceSegments.map((sentence, index) => {
              const isSelectedSentence = index === selectedSentenceIndex;
              const isPlayingSentence = playingId === sentence.id;

              return (
                <div
                  key={sentence.id}
                  className={cn(
                    "grid gap-3 rounded-[1.25rem] border p-4 transition-colors",
                    isSelectedSentence
                      ? "border-[var(--navy)] bg-[rgba(226,237,249,0.86)]"
                      : "border-[rgba(20,50,75,0.12)] bg-white/88",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex size-8 items-center justify-center rounded-2xl bg-[var(--navy)] text-xs font-semibold text-[#f7efe3]">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm leading-7 text-[var(--ink)]">{sentence.text}</p>
                        <p className="mt-1 text-xs leading-6 text-[var(--ink-soft)]">
                          Target sentence from your current speaking draft.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      {isPlayingSentence ? "Playing" : isSelectedSentence ? "Selected" : "Ready"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSentencePlayback(index)}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
                    >
                      <PlayCircle className="size-4" />
                      Play sentence
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSentenceIndex(index)}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
                    >
                      <Target className="size-4" />
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.86)] p-4">
            <p className="text-sm leading-7 text-[var(--ink)]">
              Add at least one sentence in Transcript first, then this sentence trainer will split it into shadowing targets.
            </p>
          </div>
        )}
      </article>

      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[linear-gradient(145deg,rgba(21,32,59,0.98),rgba(24,41,72,0.96))] p-5 text-[#f7efe3] shadow-[0_18px_48px_rgba(12,20,34,0.24)]">
        <p className="section-label border-white/12 bg-white/8 text-[#efe5d6]">Shadowing studio</p>
        <h3 className="font-display mt-4 text-3xl tracking-tight">
          Repeat the selected sentence aloud.
        </h3>

        {selectedSentence ? (
          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
              Target sentence
            </p>
            <p className="mt-2 text-sm leading-7 text-[#f7efe3]">{selectedSentence.text}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
              Your shadowing
            </p>
            <p className="mt-2 min-h-28 text-sm leading-7 text-[#f7efe3]">
              {shadowingTranscript || "Press Start shadowing and repeat the selected sentence aloud."}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
              Score
            </p>
            {shadowingScore ? (
              <>
                <p className="mt-2 text-4xl font-semibold text-[#f7efe3]">
                  {shadowingScore.overallScore}%
                </p>
                <p className="mt-2 text-sm leading-7 text-[#efe5d6]/82">{shadowingScore.note}</p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-7 text-[#efe5d6]/82">
                The browser will compare your spoken keywords after one attempt.
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
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.15rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
                Matched
              </p>
              <p className="mt-2 text-sm leading-7 text-[#f7efe3]">
                {shadowingScore.matchedKeywords.join(", ") || "None yet"}
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
                Missing
              </p>
              <p className="mt-2 text-sm leading-7 text-[#f7efe3]">
                {shadowingScore.missingKeywords.join(", ") || "No major misses"}
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
                Extra
              </p>
              <p className="mt-2 text-sm leading-7 text-[#f7efe3]">
                {shadowingScore.extraKeywords.join(", ") || "None"}
              </p>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
