"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, Mic } from "lucide-react";
import { useMemo, useState } from "react";

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
import { ContextDock } from "@/components/context-comments/context-dock";
import { exportAudioBlobAsWavBase64 } from "@/components/forms/speaking/audio-export";
import { SpeakingDraftPanel } from "@/components/forms/speaking/draft-panel";
import { SpeakingPartnerPanel } from "@/components/forms/speaking/partner-panel";
import { SpeakingPromptBank } from "@/components/forms/speaking/prompt-bank";
import { SpeakingRecorderPanel } from "@/components/forms/speaking/recorder-panel";
import { SpeakingScorePanel } from "@/components/forms/speaking/score-panel";
import { SpeakingShadowingPanel } from "@/components/forms/speaking/shadowing-panel";
import type { PartnerMessage, SpeakingLevel, SpeakingModuleId } from "@/components/forms/speaking/types";
import { type Locale } from "@/lib/i18n/dictionaries";
import { speakingModuleCopy } from "@/lib/speaking-modules";
import { appendSpeakingAttemptInStorage } from "@/lib/speaking-attempts";
import { getSpeakingPromptById, getSpeakingPromptsForLevel } from "@/lib/speaking-prompts";
import { useAudioRecorder } from "@/components/forms/speaking/use-audio-recorder";
import {
  getDifficultyLabel,
  getLevelForDifficulty,
  type DifficultyLabel,
} from "@/lib/level-labels";
import type { SpeakingAttemptRecord, SpeakingFeedback, SpeakingPartnerReply } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Kept this file as the stateful container for one speaking workspace, while routing decides which workspace to open.
export function SpeakingFeedbackForm({
  defaultLevel = "B1",
  module,
  locale,
  hubHref,
}: {
  defaultLevel?: SpeakingLevel;
  module: SpeakingModuleId;
  locale: Locale;
  hubHref: string;
}) {
  const easyBaseline: "A1" | "A2" = defaultLevel === "A1" ? "A1" : "A2";
  const [targetDifficulty, setTargetDifficulty] = useState<DifficultyLabel>(getDifficultyLabel(defaultLevel));
  const targetLevel = getLevelForDifficulty(targetDifficulty, easyBaseline) as SpeakingLevel;
  const initialPrompt = getSpeakingPromptsForLevel(targetLevel)[0] ?? getSpeakingPromptById("b1-language-support");
  const [selectedPromptId, setSelectedPromptId] = useState(initialPrompt?.id ?? "b1-language-support");
  const [transcript, setTranscript] = useState(initialPrompt?.sample_opening ?? "");
  const [partnerTurn, setPartnerTurn] = useState("");
  const [partnerMessages, setPartnerMessages] = useState<PartnerMessage[]>([]);
  const [partnerNote, setPartnerNote] = useState("");
  const [partnerStatus, setPartnerStatus] = useState("");
  const [result, setResult] = useState<SpeakingFeedback | null>(null);
  const [status, setStatus] = useState("");
  const [transcribeStatus, setTranscribeStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPartnerSubmitting, setIsPartnerSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorder = useAudioRecorder();

  const availablePrompts = getSpeakingPromptsForLevel(targetLevel);
  const selectedPrompt =
    getSpeakingPromptById(selectedPromptId) ?? availablePrompts[0] ?? getSpeakingPromptById("b1-language-support");
  const isReady = transcript.trim().length >= 20;
  const moduleCopy = speakingModuleCopy[module];
  const discussionContext = useMemo(
    () => ({
      module: "speaking" as const,
      targetId: `${module}:${selectedPromptId}`,
      title: selectedPrompt?.title ?? moduleCopy.label,
      subtitle: moduleCopy.label,
      plazaTag: locale === "zh" ? "口语" : "Speaking",
      topics:
        locale === "zh"
          ? ["开场", "例子", "发音", "流利度"]
          : ["Opening", "Example", "Pronunciation", "Fluency"],
      starters:
        locale === "zh"
          ? [
              "我这一句更自然的说法可以是",
              "这个 prompt 最难展开的地方是",
              "我觉得自己卡顿最多的是",
            ]
          : [
              "A more natural way to say this is",
              "The hardest part of this prompt is",
              "The place I lose fluency is",
            ],
      seedComments:
        locale === "zh"
          ? [
              {
                author: "Tutor note",
                topic: "开场",
                content: "先亮出立场，再给一个理由，会让回答更稳。",
                createdAt: "2026-03-24T08:40:00.000Z",
                likes: 5,
              },
              {
                author: "Leo",
                topic: "流利度",
                content: "我把答案先分成 claim 和 example 两段，录音会顺很多。",
                createdAt: "2026-03-24T10:25:00.000Z",
                likes: 3,
              },
            ]
          : [
              {
                author: "Tutor note",
                topic: "Opening",
                content:
                  "Lead with your position first, then add one reason. The whole response feels stronger.",
                createdAt: "2026-03-24T08:40:00.000Z",
                likes: 5,
              },
              {
                author: "Leo",
                topic: "Fluency",
                content:
                  "I split my answer into a claim and an example before recording. It reduces hesitation.",
                createdAt: "2026-03-24T10:25:00.000Z",
                likes: 3,
              },
            ],
    }),
    [locale, module, moduleCopy.label, selectedPrompt?.title, selectedPromptId],
  );
  const backLabel = locale === "zh" ? "返回口语入口" : "Back to speaking modes";

  if (!selectedPrompt) return null;

  async function resetPracticeState(nextPromptId?: string) {
    const nextPrompt = getSpeakingPromptById(nextPromptId ?? selectedPrompt.id) ?? selectedPrompt;

    setSelectedPromptId(nextPrompt.id);
    setTranscript(nextPrompt.sample_opening);
    setPartnerTurn("");
    setPartnerMessages([]);
    setPartnerNote("");
    setPartnerStatus("");
    setResult(null);
    setStatus("");
    setTranscribeStatus("");
    await recorder.resetRecording();
  }

  function handleTargetDifficultyChange(nextDifficulty: DifficultyLabel) {
    const nextLevel = getLevelForDifficulty(nextDifficulty, easyBaseline) as SpeakingLevel;
    const nextPrompts = getSpeakingPromptsForLevel(nextLevel);
    const nextPrompt = nextPrompts[0] ?? getSpeakingPromptById("b1-language-support");

    setTargetDifficulty(nextDifficulty);
    if (nextPrompt) {
      void resetPracticeState(nextPrompt.id);
    }
  }

  function handlePromptChange(promptId: string) {
    void resetPracticeState(promptId);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("");
    setResult(null);
    setIsSubmitting(true);

    const startedAt = Date.now();

    try {
      const response = await fetch("/api/ai/feedback/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt_id: selectedPrompt.id,
          target_level: targetLevel,
          transcript,
        }),
      });

      const data = (await response.json()) as SpeakingFeedback | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error || "Failed to generate speaking feedback." : "Failed to generate speaking feedback.");
      }

      setResult(data as SpeakingFeedback);
      const attemptRecord: SpeakingAttemptRecord = {
        id: globalThis.crypto?.randomUUID?.() ?? `${selectedPrompt.id}-${Date.now()}`,
        prompt_id: selectedPrompt.id,
        prompt_title: selectedPrompt.title,
        target_level: targetLevel,
        transcript,
        overall_score: (data as SpeakingFeedback).overall_score,
        task_response_score: (data as SpeakingFeedback).task_response_score,
        pronunciation_score: (data as SpeakingFeedback).pronunciation_score,
        fluency_score: (data as SpeakingFeedback).fluency_score,
        grammar_score: (data as SpeakingFeedback).grammar_score,
        strengths: (data as SpeakingFeedback).strengths,
        revision_focus: (data as SpeakingFeedback).revision_focus,
        tips: (data as SpeakingFeedback).tips,
        recording_duration_sec: recorder.audioClip ? Math.round(recorder.audioClip.durationMs / 1000) : null,
        recording_mime_type: recorder.audioClip?.mimeType ?? null,
        created_at: new Date().toISOString(),
      };
      appendSpeakingAttemptInStorage(attemptRecord);

      const durationSec = Math.max(30, Math.round((Date.now() - startedAt) / 1000));
      const passed = (data as SpeakingFeedback).overall_score >= 6;

      fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: `${selectedPrompt.id}:speaking-response`,
          answer_payload: {
            prompt_id: selectedPrompt.id,
            prompt_title: selectedPrompt.title,
            transcript,
            overall_score: (data as SpeakingFeedback).overall_score,
            task_response_score: (data as SpeakingFeedback).task_response_score,
            recording_duration_sec: recorder.audioClip ? Math.round(recorder.audioClip.durationMs / 1000) : null,
            recording_mime_type: recorder.audioClip?.mimeType ?? null,
            recording_created_at: recorder.audioClip?.createdAt ?? null,
            answer: passed,
            correct_answer: true,
          },
          duration_sec: durationSec,
        }),
      }).catch(() => {});
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to generate speaking feedback.";
      setStatus(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTranscribeLatestTake() {
    if (!recorder.audioClip) return;

    setTranscribeStatus("");
    setIsTranscribing(true);

    try {
      const wavPayload = await exportAudioBlobAsWavBase64(recorder.audioClip.blob);
      const response = await fetch("/api/ai/speaking/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_base64: wavPayload.audioBase64,
          mime_type: wavPayload.mimeType,
          duration_ms: recorder.audioClip.durationMs,
        }),
      });

      const data = (await response.json()) as { transcript?: string; error?: string };
      if (!response.ok || !data.transcript) {
        throw new Error(data.error || "Failed to transcribe the latest take.");
      }

      setTranscript(data.transcript);
      setTranscribeStatus("The latest recording has been transcribed into the draft field.");
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to transcribe the latest take.";
      setTranscribeStatus(message);
    } finally {
      setIsTranscribing(false);
    }
  }

  async function handlePartnerSubmit() {
    if (isPartnerSubmitting) return;

    const learnerTurn = partnerTurn.trim();
    if (learnerTurn.length < 6) return;

    setPartnerStatus("");
    setPartnerNote("");
    setIsPartnerSubmitting(true);
    setPartnerMessages((currentMessages) => [...currentMessages, { role: "user", content: learnerTurn }]);
    setPartnerTurn("");

    try {
      const response = await fetch("/api/ai/speaking/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learner_turn: learnerTurn,
          history: partnerMessages,
        }),
      });

      const data = (await response.json()) as SpeakingPartnerReply | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error || "Failed to continue speaking practice." : "Failed to continue speaking practice.");
      }

      const partnerReply = data as SpeakingPartnerReply;
      const assistantContent = `${partnerReply.reply} ${partnerReply.follow_up}`.trim();

      setPartnerMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", content: assistantContent },
      ]);
      setPartnerNote(partnerReply.coaching_note);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to continue speaking practice.";
      setPartnerStatus(message);
    } finally {
      setIsPartnerSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-5 reveal-up">
      <div className="flex items-center gap-3">
        <Link href={hubHref} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      </div>

      <form onSubmit={onSubmit} className="surface-panel grid gap-4 rounded-[2rem] p-5 sm:p-6">
        <div className="max-w-2xl">
          <p className="section-label">
            <Mic className="size-3.5" /> {moduleCopy.label}
          </p>
          <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">{moduleCopy.title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{moduleCopy.description}</p>
        </div>

        {module !== "partner" ? (
          <SpeakingPromptBank
            targetDifficulty={targetDifficulty}
            availablePrompts={availablePrompts}
            selectedPrompt={selectedPrompt}
            onTargetDifficultyChange={handleTargetDifficultyChange}
            onPromptChange={handlePromptChange}
          />
        ) : null}

        {module === "studio" ? (
          <>
            <SpeakingRecorderPanel
              status={recorder.status}
              error={recorder.error}
              elapsedMs={recorder.elapsedMs}
              audioLevel={recorder.audioLevel}
              audioClip={recorder.audioClip}
              isSupported={recorder.isSupported}
              isTranscribing={isTranscribing}
              transcribeStatus={transcribeStatus}
              onStart={() => void recorder.startRecording()}
              onPause={recorder.pauseRecording}
              onResume={() => void recorder.resumeRecording()}
              onStop={recorder.stopRecording}
              onReset={() => void recorder.resetRecording()}
              onTranscribe={() => void handleTranscribeLatestTake()}
            />

            <SpeakingDraftPanel transcript={transcript} onTranscriptChange={setTranscript} />

            <div className="flex flex-col gap-3 rounded-[1.45rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,255,255,0.55)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm leading-6 text-[var(--ink-soft)]">Submit the final transcript when you are ready for scoring.</div>
              <button
                type="submit"
                disabled={isSubmitting || !isReady}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                {isSubmitting ? "Scoring your response..." : "Get AI speaking score"}
              </button>
            </div>

            {status ? (
              <p className="rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
                {status}
              </p>
            ) : null}

            {isSubmitting ? (
              <AIAnalysisState
                title="Scoring your academic speaking response."
                description="The speaking coach is checking task completion, fluency, grammar, and how clearly the response matches the selected speaking prompt."
                steps={[
                  "Checking whether your response answers the selected prompt directly.",
                  "Estimating fluency, grammar control, and pronunciation from the transcript wording.",
                  "Preparing revision priorities and short practice tips for the next attempt.",
                ]}
              />
            ) : null}

            {result ? <SpeakingScorePanel result={result} onUseSampleUpgrade={setTranscript} /> : null}
          </>
        ) : null}

        {module === "shadowing" ? <SpeakingShadowingPanel prompt={selectedPrompt} transcriptSource={transcript} /> : null}

        {module === "partner" ? (
          <SpeakingPartnerPanel
            partnerMessages={partnerMessages}
            partnerTurn={partnerTurn}
            partnerStatus={partnerStatus}
            partnerNote={partnerNote}
            isPartnerSubmitting={isPartnerSubmitting}
            onPartnerTurnChange={setPartnerTurn}
            onPartnerSubmit={() => void handlePartnerSubmit()}
          />
        ) : null}
      </form>

      <ContextDock
        key={`speaking:${discussionContext.targetId}`}
        locale={locale}
        context={discussionContext}
      />
    </section>
  );
}
