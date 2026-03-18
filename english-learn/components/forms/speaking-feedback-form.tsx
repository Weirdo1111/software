"use client";

import { ArrowRight, LoaderCircle, Mic } from "lucide-react";
import { useState } from "react";

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
import { SpeakingDraftPanel } from "@/components/forms/speaking/draft-panel";
import { SpeakingHistoryPanel } from "@/components/forms/speaking/history-panel";
import { SpeakingOverviewStrip } from "@/components/forms/speaking/overview-strip";
import { SpeakingPartnerPanel } from "@/components/forms/speaking/partner-panel";
import { SpeakingPromptBank } from "@/components/forms/speaking/prompt-bank";
import { SpeakingRecorderPanel } from "@/components/forms/speaking/recorder-panel";
import { SpeakingScorePanel } from "@/components/forms/speaking/score-panel";
import { useSpeakingAttemptHistory } from "@/components/forms/speaking/use-speaking-attempt-history";
import { useAudioRecorder } from "@/components/forms/speaking/use-audio-recorder";
import type { PartnerMessage, SpeakingLevel } from "@/components/forms/speaking/types";
import { getSpeakingPromptById, getSpeakingPromptsForLevel } from "@/lib/speaking-prompts";
import type { SpeakingAttemptRecord, SpeakingFeedback, SpeakingPartnerReply } from "@/types/learning";

// Date: 2026/3/18
// Author: Tianbo Cao
// Kept this file as the stateful container so UI sections can stay modular and easy to extend.
export function SpeakingFeedbackForm({ defaultLevel = "B1" }: { defaultLevel?: SpeakingLevel }) {
  const initialPrompt = getSpeakingPromptsForLevel(defaultLevel)[0] ?? getSpeakingPromptById("b1-language-support");
  const [targetLevel, setTargetLevel] = useState<SpeakingLevel>(defaultLevel);
  const [selectedPromptId, setSelectedPromptId] = useState(initialPrompt?.id ?? "b1-language-support");
  const [transcript, setTranscript] = useState(initialPrompt?.sample_opening ?? "");
  const [partnerTurn, setPartnerTurn] = useState("");
  const [partnerMessages, setPartnerMessages] = useState<PartnerMessage[]>([]);
  const [partnerNote, setPartnerNote] = useState("");
  const [partnerStatus, setPartnerStatus] = useState("");
  const [result, setResult] = useState<SpeakingFeedback | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPartnerSubmitting, setIsPartnerSubmitting] = useState(false);
  const recorder = useAudioRecorder();
  const attemptHistory = useSpeakingAttemptHistory();

  const availablePrompts = getSpeakingPromptsForLevel(targetLevel);
  const selectedPrompt =
    getSpeakingPromptById(selectedPromptId) ?? availablePrompts[0] ?? getSpeakingPromptById("b1-language-support");
  const isReady = transcript.trim().length >= 20;

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
    await recorder.resetRecording();
  }

  function handleTargetLevelChange(nextLevel: SpeakingLevel) {
    const nextPrompts = getSpeakingPromptsForLevel(nextLevel);
    const nextPrompt = nextPrompts[0] ?? getSpeakingPromptById("b1-language-support");

    setTargetLevel(nextLevel);
    if (nextPrompt) {
      void resetPracticeState(nextPrompt.id);
    }
  }

  function handlePromptChange(promptId: string) {
    void resetPracticeState(promptId);
  }

  function appendLearnerTurnToTranscript(turn: string) {
    const normalizedTurn = turn.trim();
    if (!normalizedTurn) return;

    setTranscript((currentTranscript) =>
      currentTranscript.trim() ? `${currentTranscript.trim()}\n${normalizedTurn}` : normalizedTurn,
    );
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
      attemptHistory.addAttempt(attemptRecord);

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

  async function handlePartnerSubmit() {
    setPartnerStatus("");
    setPartnerNote("");
    setIsPartnerSubmitting(true);

    try {
      const learnerTurn = partnerTurn.trim();
      const response = await fetch("/api/ai/speaking/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt_id: selectedPrompt.id,
          target_level: targetLevel,
          learner_turn: learnerTurn,
          history: partnerMessages,
        }),
      });

      const data = (await response.json()) as SpeakingPartnerReply | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error || "Failed to continue speaking practice." : "Failed to continue speaking practice.");
      }

      const partnerReply = data as SpeakingPartnerReply;
      const assistantContent = `${partnerReply.reply}\n\nFollow-up: ${partnerReply.follow_up}`;

      setPartnerMessages((currentMessages) => [
        ...currentMessages,
        { role: "user", content: learnerTurn },
        { role: "assistant", content: assistantContent },
      ]);
      setPartnerNote(partnerReply.coaching_note);
      setPartnerTurn("");
      appendLearnerTurnToTranscript(learnerTurn);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Failed to continue speaking practice.";
      setPartnerStatus(message);
    } finally {
      setIsPartnerSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel grid gap-6 rounded-[2rem] p-6 sm:p-7">
      <div className="max-w-4xl">
        <p className="section-label">
          <Mic className="size-3.5" /> Speaking studio
        </p>
        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          Rehearse an academic response, practice with an AI partner, and then get scored feedback.
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
          Pick a prompt that matches your target band, use the AI partner to test your ideas, and then submit the final
          transcript draft for scoring.
        </p>
      </div>

      <SpeakingPromptBank
        targetLevel={targetLevel}
        availablePrompts={availablePrompts}
        selectedPrompt={selectedPrompt}
        onTargetLevelChange={handleTargetLevelChange}
        onPromptChange={handlePromptChange}
        onLoadSample={() => setTranscript(selectedPrompt.sample_opening)}
        onResetPractice={() => void resetPracticeState(selectedPrompt.id)}
      />

      <SpeakingOverviewStrip
        selectedPrompt={selectedPrompt}
        transcript={transcript}
        recorderStatus={recorder.status}
        audioClip={recorder.audioClip}
      />

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <div className="grid gap-5">
          <SpeakingRecorderPanel
            status={recorder.status}
            error={recorder.error}
            elapsedMs={recorder.elapsedMs}
            audioLevel={recorder.audioLevel}
            audioClip={recorder.audioClip}
            isSupported={recorder.isSupported}
            onStart={() => void recorder.startRecording()}
            onPause={recorder.pauseRecording}
            onResume={() => void recorder.resumeRecording()}
            onStop={recorder.stopRecording}
            onReset={() => void recorder.resetRecording()}
          />
          <SpeakingDraftPanel transcript={transcript} onTranscriptChange={setTranscript} />
        </div>
        <div className="grid gap-5">
          <SpeakingPartnerPanel
            partnerMessages={partnerMessages}
            partnerTurn={partnerTurn}
            partnerStatus={partnerStatus}
            partnerNote={partnerNote}
            isPartnerSubmitting={isPartnerSubmitting}
            onPartnerTurnChange={setPartnerTurn}
            onPartnerSubmit={() => void handlePartnerSubmit()}
          />
          <SpeakingHistoryPanel
            attempts={attemptHistory.attempts}
            selectedPromptId={selectedPrompt.id}
            selectedPromptTitle={selectedPrompt.title}
            onLoadTranscript={setTranscript}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,255,255,0.55)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-6 text-[var(--ink-soft)]">
          Submit your strongest draft after recording or partner practice. The score panel and history tracker will update
          immediately after each attempt.
        </div>
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

      {result ? <SpeakingScorePanel result={result} /> : null}
    </form>
  );
}
