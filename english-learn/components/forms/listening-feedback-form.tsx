"use client";

import {
  ArrowRight,
  CheckCircle2,
  Ear,
  ExternalLink,
  FileText,
  Globe2,
  LoaderCircle,
  Mic,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Target,
  Waves,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useShadowingPractice } from "@/components/forms/listening/use-shadowing-practice";
import { SaveToDeckButton } from "@/components/forms/save-to-deck-button";
import {
  buildListeningSentenceSegments,
  getListeningMaterial,
  getTedListeningMaterial,
  listeningAccents,
  listeningMajors,
  listeningMaterials,
  listeningModes,
  scoreShadowingAttempt,
  scoreListeningMaterial,
  type DIICSUMajorId,
  type ListeningAccent,
  type ListeningContentMode,
  type ListeningMaterial,
} from "@/lib/listening-materials";
import { cn } from "@/lib/utils";
import type { CEFRLevel } from "@/types/learning";

type ListeningWorkspaceView = "setup" | "studio" | "shadowing" | "check" | "review";

const workspaceViews: Array<{
  id: ListeningWorkspaceView;
  label: string;
  hint: string;
}> = [
  { id: "setup", label: "Setup", hint: "Choose mode, major, and target level." },
  { id: "studio", label: "Studio", hint: "Listen and build notes." },
  { id: "shadowing", label: "Shadowing", hint: "Repeat sentence-level chunks." },
  { id: "check", label: "Check", hint: "Answer the listening questions." },
  { id: "review", label: "Review", hint: "See score, evidence, and next steps." },
];

function buildAnswerState(questionIds: string[]) {
  return Object.fromEntries(questionIds.map((id) => [id, ""])) as Record<string, string>;
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function formatSeconds(value: number) {
  const totalSeconds = Math.max(0, Math.round(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getMaterialFromCatalog(
  materials: ListeningMaterial[],
  mode: ListeningContentMode,
  majorId: DIICSUMajorId,
  accent: ListeningAccent,
) {
  if (mode === "ted") {
    return (
      materials.find((item) => item.contentMode === "ted" && item.majorId === majorId) ??
      getTedListeningMaterial(majorId)
    );
  }

  return (
    materials.find(
      (item) => item.contentMode === "practice" && item.majorId === majorId && item.accent === accent,
    ) ?? getListeningMaterial(majorId, accent)
  );
}

export function ListeningFeedbackForm({
  defaultLevel = "B1",
  materials,
}: {
  defaultLevel?: CEFRLevel;
  materials?: ListeningMaterial[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentPlaybackRef = useRef<{ endTime: number; index: number } | null>(null);

  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(defaultLevel);
  const [selectedMode, setSelectedMode] = useState<ListeningContentMode>("practice");
  const [selectedMajor, setSelectedMajor] = useState<DIICSUMajorId>("civil-engineering");
  const [selectedAccent, setSelectedAccent] = useState<ListeningAccent>("british");
  const [activeView, setActiveView] = useState<ListeningWorkspaceView>("setup");
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(0);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);
  const [clipDurationSec, setClipDurationSec] = useState(0);
  const [notes, setNotes] = useState("");
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof scoreListeningMaterial> | null>(null);
  const [submitStatus, setSubmitStatus] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [attemptStartedAt, setAttemptStartedAt] = useState(() => Date.now());

  const {
    isSupported: isShadowingSupported,
    status: shadowingStatus,
    transcript: shadowingTranscript,
    error: shadowingError,
    startListening,
    stopListening,
    resetListening,
  } = useShadowingPractice();

  const catalog = materials && materials.length > 0 ? materials : listeningMaterials;
  const activeMaterial = getMaterialFromCatalog(catalog, selectedMode, selectedMajor, selectedAccent);
  const activeMajor = listeningMajors.find((major) => major.id === selectedMajor);
  const activeMode = listeningModes.find((mode) => mode.id === selectedMode);
  const isTedMode = activeMaterial.contentMode === "ted";
  const hasInlineTranscript = activeMaterial.transcript.trim().length > 0;
  const canUseSentenceTrainer =
    !isTedMode && Boolean(activeMaterial.audioSrc) && activeMaterial.transcript.trim().length > 0;

  const sentenceSegments = useMemo(
    () => buildListeningSentenceSegments(activeMaterial),
    [activeMaterial],
  );
  const selectedSentence = sentenceSegments[selectedSentenceIndex] ?? null;
  const shadowingScore =
    selectedSentence && shadowingTranscript.trim()
      ? scoreShadowingAttempt(selectedSentence.text, shadowingTranscript)
      : null;

  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    buildAnswerState(activeMaterial.questions.map((question) => question.id)),
  );

  const answeredCount = activeMaterial.questions.filter(
    (question) => (answers[question.id] ?? "").trim().length >= 2,
  ).length;
  const totalQuestions = activeMaterial.questions.length;
  const noteWordCount = countWords(notes);
  const progressPercent = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);
  const isReady = answeredCount === totalQuestions;

  function clearSentencePlayback() {
    segmentPlaybackRef.current = null;
    setPlayingSentenceIndex(null);
  }

  function resetAttempt(
    nextMode: ListeningContentMode,
    nextMajor: DIICSUMajorId,
    nextAccent: ListeningAccent,
  ) {
    const nextMaterial = getMaterialFromCatalog(catalog, nextMode, nextMajor, nextAccent);

    setNotes("");
    setTranscriptOpen(false);
    setResult(null);
    setSubmitStatus("");
    setAttemptStartedAt(Date.now());
    setAnswers(buildAnswerState(nextMaterial.questions.map((question) => question.id)));
    setActiveView("setup");
  }

  function handleModeChange(nextMode: ListeningContentMode) {
    setSelectedMode(nextMode);
    resetAttempt(nextMode, selectedMajor, selectedAccent);
  }

  function handleMajorChange(nextMajor: DIICSUMajorId) {
    setSelectedMajor(nextMajor);
    resetAttempt(selectedMode, nextMajor, selectedAccent);
  }

  function handleAccentChange(nextAccent: ListeningAccent) {
    setSelectedAccent(nextAccent);
    resetAttempt(selectedMode, selectedMajor, nextAccent);
  }

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function handleSentencePlayback(index: number) {
    const audio = audioRef.current;
    const sentence = sentenceSegments[index];

    if (!audio || !sentence || clipDurationSec <= 0) {
      return;
    }

    const startTime = Math.max(0, sentence.startRatio * clipDurationSec);
    const endTime = Math.max(startTime + 0.5, sentence.endRatio * clipDurationSec);

    setSelectedSentenceIndex(index);
    setPlayingSentenceIndex(index);
    segmentPlaybackRef.current = { endTime, index };
    audio.currentTime = startTime;
    void audio.play().catch(() => {});
  }

  function handlePlayFullClip() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    clearSentencePlayback();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  function handleStopPlayback() {
    audioRef.current?.pause();
    clearSentencePlayback();
  }

  function handleShadowingStart() {
    const locale = activeMaterial.voiceLocales[0] ?? "en-GB";
    startListening(locale);
  }

  useEffect(() => {
    setSelectedSentenceIndex(0);
    setPlayingSentenceIndex(null);
    setClipDurationSec(0);
    segmentPlaybackRef.current = null;
    resetListening();

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [activeMaterial.id, resetListening]);

  useEffect(() => {
    resetListening();
  }, [selectedSentenceIndex, resetListening]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsScoring(true);
    setSubmitStatus("");

    try {
      const nextResult = scoreListeningMaterial(activeMaterial, answers, notes, targetLevel);
      setResult(nextResult);
      setActiveView("review");

      const durationSec = Math.max(45, Math.round((Date.now() - attemptStartedAt) / 1000));
      fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: `${activeMaterial.id}:listening-check`,
          answer_payload: {
            major: activeMaterial.majorLabel,
            mode: activeMaterial.contentMode,
            accent: activeMaterial.accentLabel,
            source: activeMaterial.sourceName,
            level: targetLevel,
            score: nextResult.overallScore,
            notes,
            answers,
            answer: nextResult.passed,
            correct_answer: true,
          },
          duration_sec: durationSec,
        }),
      }).catch(() => {});
    } catch (error) {
      setSubmitStatus(
        error instanceof Error ? error.message : "Listening check failed. Please try again.",
      );
    } finally {
      setIsScoring(false);
    }
  }

  const renderSetupView = () => (
    <section className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(239,245,252,0.82))] p-5 shadow-[0_18px_48px_rgba(18,32,52,0.06)]">
        <p className="section-label">
          <Target className="size-3.5" /> Session setup
        </p>
        <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          Start with one clear listening route.
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Current route
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              {activeMaterial.majorLabel} · {activeMode?.label}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{activeMajor?.focus}</p>
          </div>
          <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Delivery profile
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              {isTedMode ? "Official TED delivery" : activeMaterial.accentLabel}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{activeMaterial.accentHint}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.3rem] border border-[rgba(20,50,75,0.12)] bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Session scenario
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeMaterial.scenario}</p>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            {activeMaterial.supportFocus}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveView("studio")}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] shadow-[0_12px_28px_rgba(28,78,149,0.2)]"
          >
            <ArrowRight className="size-4" />
            Open studio
          </button>
          <button
            type="button"
            onClick={() => setActiveView("check")}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Go to questions
          </button>
        </div>
      </article>

      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_18px_48px_rgba(18,32,52,0.06)]">
        <p className="section-label">Preview panel</p>
        <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          What this listening block trains.
        </h3>
        <div className="mt-5 grid gap-3">
          {activeMaterial.notePrompts.map((item, index) => (
            <div
              key={item}
              className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.86)] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Prompt {index + 1}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,249,239,0.84)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Follow-up task
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeMaterial.followUpTask}</p>
        </div>
      </article>
    </section>
  );

  const renderStudioView = () => (
    <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[linear-gradient(150deg,#dcebf8_0%,rgba(255,255,255,0.96)_48%,#edf5fd_100%)] p-5 shadow-[0_20px_52px_rgba(18,32,52,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label">
              <Ear className="size-3.5" /> Listening studio
            </p>
            <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
              {activeMaterial.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {activeMaterial.speakerName
                ? `${activeMaterial.speakerName} · ${activeMaterial.speakerRole}`
                : activeMaterial.speakerRole}
            </p>
          </div>
          <div className="rounded-[1.1rem] bg-[var(--navy)] px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[#f7efe3]">
            <div>{isTedMode ? "TED listening" : activeMaterial.accentLabel}</div>
            <div className="mt-1 opacity-80">{activeMaterial.durationLabel}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-white/60 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Scenario
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeMaterial.scenario}</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/60 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Focus
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeMaterial.supportFocus}</p>
          </div>
        </div>

        {isTedMode ? (
          <div className="mt-5 rounded-[1.4rem] border border-[rgba(20,50,75,0.14)] bg-[linear-gradient(145deg,rgba(21,32,59,0.98),rgba(24,41,72,0.96))] p-4 text-[#f7efe3]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2d9ae]">
                  Official TED player
                </p>
                <p className="mt-2 text-sm leading-7 text-[#efe5d6]/82">
                  Keep playback on the official source while notes stay inside this study workspace.
                </p>
              </div>
              <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f7efe3]">
                Embedded from TED
              </div>
            </div>

            {activeMaterial.embedUrl ? (
              <div className="mt-4 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b1220]">
                <iframe
                  key={activeMaterial.id}
                  src={activeMaterial.embedUrl}
                  title={`${activeMaterial.title} TED talk`}
                  className="aspect-video w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              {activeMaterial.officialUrl ? (
                <a
                  href={activeMaterial.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f7efe3]"
                >
                  <ExternalLink className="size-4" />
                  Open official TED page
                </a>
              ) : null}
              {activeMaterial.transcriptUrl ? (
                <a
                  href={activeMaterial.transcriptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f7efe3]"
                >
                  <FileText className="size-4" />
                  Open official transcript
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[1.4rem] border border-[rgba(20,50,75,0.14)] bg-white/82 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Audio studio
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                  Short controlled playback keeps this screen focused on listening and note-taking.
                </p>
              </div>
              {activeMaterial.audioVoice ? (
                <div className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Voice: {activeMaterial.audioVoice}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePlayFullClip}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-[#f7efe3]"
              >
                <PlayCircle className="size-4" />
                Play full clip
              </button>
              <button
                type="button"
                onClick={handleStopPlayback}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
              >
                <PauseCircle className="size-4" />
                Stop
              </button>
              {activeMaterial.audioSrc ? (
                <a
                  href={activeMaterial.audioSrc}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
                >
                  <ExternalLink className="size-4" />
                  Open audio file
                </a>
              ) : null}
            </div>
          </div>
        )}
      </article>

      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_20px_52px_rgba(18,32,52,0.06)]">
        <p className="section-label">Note workspace</p>
        <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          Keep notes before you answer.
        </h3>
        <div className="mt-5 grid gap-3">
          {activeMaterial.notePrompts.map((item, index) => (
            <div
              key={item}
              className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.84)] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Prompt {index + 1}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{item}</p>
            </div>
          ))}
        </div>

        <label className="mt-5 grid gap-2 text-sm font-medium text-[var(--ink)]">
          Structured notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={activeMaterial.notePrompts.map((item) => `- ${item}`).join("\n")}
            className="min-h-72 rounded-[1.35rem] border border-[rgba(20,50,75,0.14)] bg-white/90 px-4 py-4 text-sm leading-7 outline-none"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          {!isTedMode && canUseSentenceTrainer ? (
            <button
              type="button"
              onClick={() => setActiveView("shadowing")}
              className="inline-flex items-center gap-2 rounded-full bg-[#7b4b14] px-5 py-3 text-sm font-semibold text-white"
            >
              <Waves className="size-4" />
              Open shadowing
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setActiveView("check")}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Go to listening check
          </button>
        </div>
      </article>
    </section>
  );

  const renderShadowingView = () => (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.98fr]">
      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.84)] p-5 shadow-[0_18px_48px_rgba(18,32,52,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-label">
              <Waves className="size-3.5" /> Sentence trainer
            </p>
            <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
              Practice one sentence at a time.
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              This section is separated from the main studio so the page stays shorter and easier to control.
            </p>
          </div>
          <div className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            {canUseSentenceTrainer ? "Active" : "Practice only"}
          </div>
        </div>

        {canUseSentenceTrainer ? (
          <div className="mt-5 grid gap-3 max-h-[36rem] overflow-y-auto pr-1">
            {sentenceSegments.map((sentence, index) => {
              const startTime = clipDurationSec > 0 ? sentence.startRatio * clipDurationSec : 0;
              const endTime = clipDurationSec > 0 ? sentence.endRatio * clipDurationSec : 0;
              const isSelectedSentence = index === selectedSentenceIndex;
              const isPlayingSentence = index === playingSentenceIndex;

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
                        {clipDurationSec > 0 ? (
                          <p className="mt-1 text-xs leading-6 text-[var(--ink-soft)]">
                            Approx. {formatSeconds(startTime)} - {formatSeconds(endTime)}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs leading-6 text-[var(--ink-soft)]">
                            Loading audio timing...
                          </p>
                        )}
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
                      disabled={clipDurationSec <= 0}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
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
              Sentence-level playback and shadowing stay inside the DIICSU practice clips where this page can control audio directly.
            </p>
            <p className="mt-2 text-xs leading-6 text-[var(--ink-soft)]">
              TED mode keeps media on the official player, so this view becomes a recommendation page instead of a playback tool.
            </p>
          </div>
        )}
      </article>

      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[linear-gradient(145deg,rgba(21,32,59,0.98),rgba(24,41,72,0.96))] p-5 text-[#f7efe3] shadow-[0_18px_48px_rgba(12,20,34,0.24)]">
        <p className="section-label border-white/12 bg-white/8 text-[#efe5d6]">Shadowing studio</p>
        <h3 className="font-display mt-4 text-3xl tracking-tight">
          Repeat the target sentence aloud.
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
            onClick={() => handleSentencePlayback(selectedSentenceIndex)}
            disabled={!canUseSentenceTrainer || clipDurationSec <= 0}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlayCircle className="size-4" />
            Replay target
          </button>
          <button
            type="button"
            onClick={handleShadowingStart}
            disabled={!canUseSentenceTrainer || !isShadowingSupported || shadowingStatus === "listening"}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic className="size-4" />
            {shadowingStatus === "listening" ? "Listening..." : "Start shadowing"}
          </button>
          <button
            type="button"
            onClick={stopListening}
            disabled={shadowingStatus !== "listening"}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PauseCircle className="size-4" />
            Stop
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

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveView("check")}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Continue to check
          </button>
          <button
            type="button"
            onClick={() => setActiveView("studio")}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-[#f7efe3]"
          >
            Back to studio
          </button>
        </div>
      </article>
    </section>
  );

  const renderCheckView = () => (
    <section className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.84)] p-5 shadow-[0_20px_52px_rgba(18,32,52,0.06)]">
        <p className="section-label">Listening check</p>
        <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          Answer the checkpoints.
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
          This section is separated from playback so the answer area stays focused and shorter.
        </p>

        <div className="mt-5 grid gap-3">
          {activeMaterial.questions.map((question, index) => {
            const hasAnswer = (answers[question.id] ?? "").trim().length >= 2;

            return (
              <label
                key={question.id}
                className={cn(
                  "grid gap-3 rounded-[1.3rem] border p-4 transition-colors",
                  hasAnswer
                    ? "border-[#6a9483]/35 bg-[#edf6f1]"
                    : "border-[rgba(20,50,75,0.12)] bg-white/88",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex size-9 items-center justify-center rounded-2xl bg-[var(--navy)] text-sm font-semibold text-[#f7efe3]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">{question.prompt}</p>
                      <p className="mt-1 text-xs leading-6 text-[var(--ink-soft)]">
                        {question.rubricNote}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    {hasAnswer ? "Captured" : "Pending"}
                  </span>
                </div>

                {question.id === "signpost" || question.id === "term" ? (
                  <input
                    type="text"
                    value={answers[question.id] ?? ""}
                    onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                    placeholder={question.placeholder}
                    className="rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white px-4 py-3 text-sm outline-none"
                  />
                ) : (
                  <textarea
                    value={answers[question.id] ?? ""}
                    onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                    placeholder={question.placeholder}
                    className="min-h-28 rounded-[1.1rem] border border-[rgba(20,50,75,0.16)] bg-white px-4 py-3 text-sm leading-7 outline-none"
                  />
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!isReady || isScoring}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isScoring ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {isScoring ? "Checking answers..." : "Score listening check"}
          </button>
          <button
            type="button"
            onClick={() => setActiveView("studio")}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Back to studio
          </button>
        </div>

        {submitStatus ? (
          <p className="mt-4 rounded-[1rem] bg-[rgba(255,244,240,0.9)] px-4 py-3 text-sm font-medium text-[var(--coral)]">
            {submitStatus}
          </p>
        ) : null}
      </article>

      <article className="rounded-[1.85rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_20px_52px_rgba(18,32,52,0.06)]">
        <p className="section-label">Support panel</p>
        <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
          Keep the answer tools nearby.
        </h3>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-white/86 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              Progress
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              {answeredCount}/{totalQuestions}
            </p>
          </div>
          <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-white/86 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              Notes
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{noteWordCount} words</p>
          </div>
          <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-white/86 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              Source
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{activeMaterial.sourceName}</p>
          </div>
        </div>

        {hasInlineTranscript ? (
          <div className="mt-5 rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.86)] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Transcript
              </p>
              <button
                type="button"
                onClick={() => setTranscriptOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]"
              >
                <FileText className="size-4" />
                {transcriptOpen ? "Hide" : "Show"}
              </button>
            </div>
            {transcriptOpen ? (
              <p className="mt-4 text-sm leading-7 text-[var(--ink)]">{activeMaterial.transcript}</p>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                Open the transcript only after you have completed your own notes and answers.
              </p>
            )}
          </div>
        ) : activeMaterial.transcriptUrl ? (
          <div className="mt-5 rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.86)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Official transcript
            </p>
            <a
              href={activeMaterial.transcriptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--navy)] underline-offset-4 hover:underline"
            >
              <ExternalLink className="size-4" />
              Open transcript on TED
            </a>
          </div>
        ) : null}

        <div className="mt-5 rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(247,250,252,0.86)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Vocabulary deck
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeMaterial.vocabulary.map((item) => (
              <span
                key={item.term}
                className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)]"
              >
                {item.term}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <SaveToDeckButton
              tag="Listening"
              items={activeMaterial.vocabulary.map((item) => ({
                front: item.term,
                back: item.definition,
              }))}
            />
          </div>
        </div>
      </article>
    </section>
  );

  const renderReviewView = () => (
    <section className="grid gap-5 lg:grid-cols-[0.94fr_1.06fr]">
      {result ? (
        <>
          <article className="surface-ink rounded-[1.95rem] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f2d9ae]">
              Listening result
            </p>
            <div className="mt-5 flex items-center gap-4">
              <div className="inline-flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/8">
                <CheckCircle2 className="size-7 text-[#f7efe3]" />
              </div>
              <div>
                <h3 className="font-display text-5xl tracking-tight text-[#f7efe3]">
                  {result.overallScore}/10
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#efe5d6]/78">
                  {result.correctCount} of {result.totalQuestions} checkpoints correct at {targetLevel} target.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {result.strengths.map((strength) => (
                <p key={strength} className="text-sm leading-7 text-[#efe5d6]/82">
                  {strength}
                </p>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
                  Note feedback
                </p>
                <p className="mt-2 text-sm leading-7 text-[#f7efe3]">{result.noteFeedback}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
                  Next step
                </p>
                <p className="mt-2 text-sm leading-7 text-[#f7efe3]">{result.nextAction}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f2d9ae]">
                Revision focus
              </p>
              <p className="mt-2 text-sm leading-7 text-[#f7efe3]">{result.revisionFocus}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveView("studio")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]"
              >
                Back to studio
              </button>
              <button
                type="button"
                onClick={() => setActiveView("check")}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-[#f7efe3]"
              >
                Re-open questions
              </button>
            </div>
          </article>

          <article className="surface-panel rounded-[1.95rem] p-6 sm:p-7">
            <p className="section-label">Evidence review</p>
            <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
              See where the answers came from.
            </h3>
            <div className="mt-5 grid gap-3 max-h-[42rem] overflow-y-auto pr-1">
              {result.questionFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className={cn(
                    "rounded-[1.3rem] border p-4",
                    feedback.correct
                      ? "border-[#6a9483]/40 bg-[#edf6f1]"
                      : "border-[#d88e34]/35 bg-[#fff4e4]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--ink)]">{feedback.prompt}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      {feedback.correct ? "Matched" : "Review"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                    Your answer: {feedback.answer || "No answer provided."}
                  </p>
                  {!feedback.correct ? (
                    <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                      Model answer: {feedback.modelAnswer}
                    </p>
                  ) : null}
                  {feedback.evidenceSentence ? (
                    <div className="mt-3 rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-white/72 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        Evidence sentence
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                        {feedback.evidenceSentence}
                      </p>
                    </div>
                  ) : activeMaterial.transcriptUrl ? (
                    <div className="mt-3 rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-white/72 p-3">
                      <a
                        href={activeMaterial.transcriptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--navy)] underline-offset-4 hover:underline"
                      >
                        <ExternalLink className="size-4" />
                        Open official transcript
                      </a>
                    </div>
                  ) : null}
                  <p className="mt-3 text-xs leading-6 text-[var(--ink-soft)]">
                    {feedback.rubricNote} {feedback.evidenceNote}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </>
      ) : (
        <article className="surface-panel rounded-[1.95rem] p-6 sm:p-7">
          <p className="section-label">Review panel</p>
          <h3 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">
            Score the listening check first.
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            Keeping review on its own page makes the whole listening module shorter and easier to scan.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setActiveView("check")}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-[#f7efe3]"
            >
              <ArrowRight className="size-4" />
              Go to listening check
            </button>
          </div>
        </article>
      )}
    </section>
  );

  return (
    <form
      onSubmit={onSubmit}
      className="surface-panel relative overflow-hidden rounded-[2.1rem] p-5 sm:p-6 lg:p-7"
    >
      {activeMaterial.audioSrc ? (
        <audio
          key={activeMaterial.id}
          ref={audioRef}
          preload="metadata"
          className="hidden"
          src={activeMaterial.audioSrc}
          onLoadedMetadata={(event) => {
            setClipDurationSec(event.currentTarget.duration || 0);
          }}
          onTimeUpdate={(event) => {
            const segmentPlayback = segmentPlaybackRef.current;

            if (segmentPlayback && event.currentTarget.currentTime >= segmentPlayback.endTime) {
              event.currentTarget.pause();
              clearSentencePlayback();
            }
          }}
          onEnded={() => clearSentencePlayback()}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(28,78,149,0.14),transparent_52%),radial-gradient(circle_at_top_right,rgba(206,156,69,0.12),transparent_42%)]" />

      <div className="relative grid gap-6">
        <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="section-label">
                <Ear className="size-3.5" /> Listening studio
              </p>
              <span className="signal-pill">Structured as a compact multi-page workflow</span>
            </div>
            <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              A shorter listening experience with clearer page jumps.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
              Instead of stacking every tool on one long screen, this listening module now works
              like a guided workspace: setup, studio, shadowing, check, and review.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
            <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-white/78 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Current page
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {workspaceViews.find((item) => item.id === activeView)?.label}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-white/78 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Progress
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{progressPercent}%</p>
            </div>
            <div className="rounded-[1.25rem] border border-[rgba(20,50,75,0.12)] bg-white/78 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Active route
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ink)]">
                {activeMaterial.majorLabel} · {activeMode?.label}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-[1.8rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.64)] p-4 shadow-[0_18px_44px_rgba(18,32,52,0.05)] xl:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-4">
            <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.12)] bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    Listening mode
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    Select a route before jumping into the working pages.
                  </p>
                </div>
                <label className="grid gap-2 text-sm font-medium text-[var(--ink)]">
                  Target level
                  <select
                    value={targetLevel}
                    onChange={(event) => setTargetLevel(event.target.value as CEFRLevel)}
                    className="w-fit rounded-[1rem] border border-[rgba(20,50,75,0.16)] bg-[rgba(247,250,252,0.9)] px-4 py-3 text-sm outline-none"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {listeningModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeChange(mode.id)}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm font-semibold transition-all",
                      selectedMode === mode.id
                        ? "border-[var(--navy)] bg-[var(--navy)] text-[#f7efe3]"
                        : "border-[rgba(20,50,75,0.16)] bg-white text-[var(--ink)] hover:border-[var(--navy)] hover:text-[var(--navy)]",
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.12)] bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                DIICSU major route
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {listeningMajors.map((major) => (
                  <button
                    key={major.id}
                    type="button"
                    onClick={() => handleMajorChange(major.id)}
                    className={cn(
                      "rounded-full border px-4 py-2.5 text-sm font-semibold transition-all",
                      selectedMajor === major.id
                        ? "border-[var(--navy)] bg-[var(--navy)] text-[#f7efe3]"
                        : "border-[rgba(20,50,75,0.16)] bg-white text-[var(--ink)] hover:border-[var(--navy)] hover:text-[var(--navy)]",
                    )}
                  >
                    {major.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {selectedMode === "practice" ? (
              <div className="rounded-[1.35rem] border border-[rgba(20,50,75,0.12)] bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Accent profile
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {listeningAccents.map((accent) => (
                    <button
                      key={accent.id}
                      type="button"
                      onClick={() => handleAccentChange(accent.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all",
                        selectedAccent === accent.id
                          ? "border-[#7b4b14] bg-[#7b4b14] text-white"
                          : "border-[rgba(20,50,75,0.16)] bg-white text-[var(--ink)] hover:border-[#7b4b14] hover:text-[#7b4b14]",
                      )}
                    >
                      <Globe2 className="size-4" />
                      {accent.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.45rem] border border-[rgba(20,50,75,0.14)] bg-[linear-gradient(145deg,rgba(252,250,246,0.92),rgba(238,244,250,0.82))] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Live session snapshot
                </p>
                <h3 className="font-display mt-2 text-2xl tracking-tight text-[var(--ink)]">
                  {activeMaterial.title}
                </h3>
              </div>
              <div className="rounded-full border border-[rgba(20,50,75,0.12)] bg-white/86 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                {isTedMode ? "Official source" : activeMaterial.accentLabel}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Focus area
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeMajor?.focus}</p>
              </div>
              <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Delivery
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{activeMaterial.accentHint}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Duration
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{activeMaterial.durationLabel}</p>
              </div>
              <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Notes
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{noteWordCount} words</p>
              </div>
              <div className="rounded-[1.15rem] border border-[rgba(20,50,75,0.12)] bg-white/84 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Check
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                  {answeredCount}/{totalQuestions} answered
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-[1.65rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.72)] p-3 shadow-[0_14px_36px_rgba(18,32,52,0.05)]">
          <div className="flex flex-wrap gap-2">
            {workspaceViews.map((view, index) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id)}
                className={cn(
                  "flex-1 rounded-[1.1rem] border px-4 py-3 text-left transition-all min-w-[140px]",
                  activeView === view.id
                    ? "border-[var(--navy)] bg-[var(--navy)] text-[#f7efe3]"
                    : "border-[rgba(20,50,75,0.12)] bg-white/88 text-[var(--ink)] hover:border-[var(--navy)]",
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-sm font-semibold">{view.label}</p>
                <p
                  className={cn(
                    "mt-1 text-xs leading-5",
                    activeView === view.id ? "text-[#efe5d6]" : "text-[var(--ink-soft)]",
                  )}
                >
                  {view.hint}
                </p>
              </button>
            ))}
          </div>
        </section>

        {activeView === "setup" ? renderSetupView() : null}
        {activeView === "studio" ? renderStudioView() : null}
        {activeView === "shadowing" ? renderShadowingView() : null}
        {activeView === "check" ? renderCheckView() : null}
        {activeView === "review" ? renderReviewView() : null}
      </div>
    </form>
  );
}
