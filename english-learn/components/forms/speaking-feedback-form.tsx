"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, Mic } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AIAnalysisState } from "@/components/forms/ai-analysis-state";
import { exportAudioBlobAsWavBase64 } from "@/components/forms/speaking/audio-export";
import { SpeakingDraftPanel } from "@/components/forms/speaking/draft-panel";
import { SpeakingHistoryPanel } from "@/components/forms/speaking/history-panel";
import { SpeakingOverviewStrip } from "@/components/forms/speaking/overview-strip";
import { SpeakingPartnerPanel } from "@/components/forms/speaking/partner-panel";
import { SpeakingPromptBank } from "@/components/forms/speaking/prompt-bank";
import { SpeakingRecorderPanel } from "@/components/forms/speaking/recorder-panel";
import { SpeakingScorePanel } from "@/components/forms/speaking/score-panel";
import { SpeakingShadowingPanel } from "@/components/forms/speaking/shadowing-panel";
import type { PartnerMessage, SpeakingModuleId, SpeakingScenarioFilter } from "@/components/forms/speaking/types";
import { useAudioRecorder } from "@/components/forms/speaking/use-audio-recorder";
import { useSpeakingAttemptHistory } from "@/components/forms/speaking/use-speaking-attempt-history";
import { type Locale } from "@/lib/i18n/dictionaries";
import { appendSpeakingAttemptInStorage } from "@/lib/speaking-attempts";
import { recordSkillAttemptInStorage } from "@/lib/learning-tracker";
import { speakingModuleCopy } from "@/lib/speaking-modules";
import {
  getSpeakingPromptById,
  getSpeakingPrompts,
  mapCEFRToSpeakingDifficulty,
  speakingPromptMajors,
} from "@/lib/speaking-prompts";
import type {
  CEFRLevel,
  DIICSUMajorId,
  SpeakingAttemptRecord,
  SpeakingDifficulty,
  SpeakingFeedback,
  SpeakingPartnerReply,
} from "@/types/learning";

export function SpeakingFeedbackForm({
  defaultLevel = "B1",
  module,
  locale,
  hubHref,
}: {
  defaultLevel?: CEFRLevel;
  module: SpeakingModuleId;
  locale: Locale;
  hubHref: string;
}) {
  const initialDifficulty = mapCEFRToSpeakingDifficulty(defaultLevel);
  const fallbackPrompt = getSpeakingPrompts({ difficulty: initialDifficulty })[0] ?? getSpeakingPrompts()[0] ?? null;
  const initialPrompt = fallbackPrompt;

  const [selectedMajorId, setSelectedMajorId] = useState<DIICSUMajorId>(
    initialPrompt?.major_id ?? speakingPromptMajors[0]?.id ?? "civil-engineering",
  );
  const [targetLevel, setTargetLevel] = useState<SpeakingDifficulty>(initialPrompt?.difficulty ?? initialDifficulty);
  const [selectedCategory, setSelectedCategory] = useState<SpeakingScenarioFilter>("all");
  const [selectedPromptId, setSelectedPromptId] = useState(initialPrompt?.id ?? "");
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
  const { attempts } = useSpeakingAttemptHistory();
  const moduleCopy = speakingModuleCopy[module];
  const backLabel = locale === "zh" ? "返回口语入口" : "Back to speaking modes";

  const availablePrompts = getSpeakingPrompts({
    majorId: selectedMajorId,
    difficulty: targetLevel,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });
  const promptFromState = getSpeakingPromptById(selectedPromptId);
  const selectedPrompt =
    (promptFromState && availablePrompts.some((prompt) => prompt.id === promptFromState.id) ? promptFromState : null) ??
    availablePrompts[0] ??
    fallbackPrompt;
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
    setTranscribeStatus("");
    await recorder.resetRecording();
  }

  function handleTargetLevelChange(nextLevel: SpeakingDifficulty) {
    const matchingPrompt = getSpeakingPrompts({
      majorId: selectedMajorId,
      difficulty: nextLevel,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    })[0];
    const nextPrompt =
      matchingPrompt ??
      getSpeakingPrompts({ majorId: selectedMajorId, difficulty: nextLevel })[0] ??
      getSpeakingPrompts({ majorId: selectedMajorId })[0] ??
      fallbackPrompt;

    setTargetLevel(nextLevel);
    if (nextPrompt) {
      setSelectedMajorId(nextPrompt.major_id);
      setSelectedCategory(selectedCategory === "all" || matchingPrompt ? selectedCategory : nextPrompt.category);
      void resetPracticeState(nextPrompt.id);
    }
  }

  function handleMajorChange(nextMajorId: DIICSUMajorId) {
    const matchingPrompt = getSpeakingPrompts({
      majorId: nextMajorId,
      difficulty: targetLevel,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    })[0];
    const nextPrompt =
      matchingPrompt ??
      getSpeakingPrompts({ majorId: nextMajorId, difficulty: targetLevel })[0] ??
      getSpeakingPrompts({ majorId: nextMajorId })[0] ??
      fallbackPrompt;

    setSelectedMajorId(nextMajorId);
    if (nextPrompt) {
      setTargetLevel(nextPrompt.difficulty);
      setSelectedCategory(selectedCategory === "all" || matchingPrompt ? selectedCategory : nextPrompt.category);
      void resetPracticeState(nextPrompt.id);
    }
  }

  function handleCategoryChange(nextCategory: SpeakingScenarioFilter) {
    const nextPrompt =
      getSpeakingPrompts({
        majorId: selectedMajorId,
        difficulty: targetLevel,
        category: nextCategory === "all" ? undefined : nextCategory,
      })[0] ??
      getSpeakingPrompts({ majorId: selectedMajorId, difficulty: targetLevel })[0] ??
      fallbackPrompt;

    if (!nextPrompt) return;

    setSelectedCategory(nextCategory === "all" ? "all" : nextPrompt.category);
    setSelectedMajorId(nextPrompt.major_id);
    setTargetLevel(nextPrompt.difficulty);
    void resetPracticeState(nextPrompt.id);
  }

  function handlePromptChange(promptId: string) {
    void resetPracticeState(promptId);
  }

  async function onSubmit(event: FormEvent) {
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

      const feedback = data as SpeakingFeedback;
      setResult(feedback);

      const attemptRecord: SpeakingAttemptRecord = {
        id: globalThis.crypto?.randomUUID?.() ?? `${selectedPrompt.id}-${Date.now()}`,
        prompt_id: selectedPrompt.id,
        prompt_title: selectedPrompt.title,
        target_level: targetLevel,
        major_id: selectedPrompt.major_id,
        category: selectedPrompt.category,
        transcript,
        overall_score: feedback.overall_score,
        task_response_score: feedback.task_response_score,
        pronunciation_score: feedback.pronunciation_score,
        fluency_score: feedback.fluency_score,
        grammar_score: feedback.grammar_score,
        strengths: feedback.strengths,
        revision_focus: feedback.revision_focus,
        tips: feedback.tips,
        recording_duration_sec: recorder.audioClip ? Math.round(recorder.audioClip.durationMs / 1000) : null,
        recording_mime_type: recorder.audioClip?.mimeType ?? null,
        created_at: new Date().toISOString(),
      };
      appendSpeakingAttemptInStorage(attemptRecord);

      const durationSec = Math.max(30, Math.round((Date.now() - startedAt) / 1000));
      const passed = feedback.overall_score >= 6;
      recordSkillAttemptInStorage("speaking", {
        correct: passed,
        durationSec,
        markCompleted: true,
      });

      fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: `${selectedPrompt.id}:speaking-response`,
          answer_payload: {
            prompt_id: selectedPrompt.id,
            prompt_title: selectedPrompt.title,
            transcript,
            overall_score: feedback.overall_score,
            task_response_score: feedback.task_response_score,
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
          prompt_id: selectedPrompt.id,
          target_level: targetLevel,
          task_context: {
            title: selectedPrompt.title,
            major_label: selectedPrompt.major_label,
            category_label: selectedPrompt.category_label,
            scenario: selectedPrompt.scenario,
            partner_role: selectedPrompt.partner_role,
            partner_goal: selectedPrompt.partner_goal,
          },
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
    <section className="mx-auto max-w-5xl space-y-4 reveal-up">
      <div className="flex items-center gap-3">
        <Link
          href={hubHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      </div>

      <form onSubmit={onSubmit} className="surface-panel grid gap-3 rounded-[1.7rem] p-4 sm:p-5">
        <div className="max-w-3xl">
          <p className="section-label">
            <Mic className="size-3.5" /> {moduleCopy.label}
          </p>
          <h2 className="font-display mt-3 text-2xl tracking-tight text-[var(--ink)] sm:text-[2rem]">{moduleCopy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{moduleCopy.description}</p>
        </div>

        <SpeakingPromptBank
          selectedMajorId={selectedMajorId}
          targetLevel={targetLevel}
          selectedCategory={selectedCategory}
          availablePrompts={availablePrompts}
          selectedPrompt={selectedPrompt}
          onMajorChange={handleMajorChange}
          onTargetLevelChange={handleTargetLevelChange}
          onCategoryChange={handleCategoryChange}
          onPromptChange={handlePromptChange}
        />

        <SpeakingOverviewStrip
          selectedPrompt={selectedPrompt}
          transcript={transcript}
          recorderStatus={recorder.status}
          audioClip={recorder.audioClip}
          isRecorderSupported={recorder.isSupported}
        />

        {module === "studio" ? (
          <>
            <div className="grid gap-3 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
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
            </div>

            <div className="flex flex-col gap-3 rounded-[1.2rem] border border-[rgba(20,50,75,0.08)] bg-[rgba(255,255,255,0.55)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm leading-6 text-[var(--ink-soft)]">Score the current draft when it is ready.</div>
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

            {result ? <SpeakingScorePanel result={result} prompt={selectedPrompt} onUseSampleUpgrade={setTranscript} /> : null}

            <SpeakingHistoryPanel
              attempts={attempts}
              selectedPromptId={selectedPrompt.id}
              selectedPromptTitle={selectedPrompt.title}
              onLoadTranscript={setTranscript}
            />
          </>
        ) : null}

        {module === "rehearsal" ? (
          <div className="grid gap-3 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
            <SpeakingShadowingPanel prompt={selectedPrompt} transcriptSource={transcript} />

            <SpeakingPartnerPanel
              prompt={selectedPrompt}
              targetLevel={targetLevel}
              partnerMessages={partnerMessages}
              partnerTurn={partnerTurn}
              partnerStatus={partnerStatus}
              partnerNote={partnerNote}
              isPartnerSubmitting={isPartnerSubmitting}
              onPartnerTurnChange={setPartnerTurn}
              onPartnerSubmit={() => void handlePartnerSubmit()}
            />
          </div>
        ) : null}
      </form>
    </section>
  );
}
