"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Ear, Lightbulb, Play } from "lucide-react";

import { isChoiceCorrect, listeningWeekOneItems, type ListeningItem } from "@/lib/listening";
import { recordSkillAttemptInStorage } from "@/lib/learning-tracker";

function getWeakPointLabel(item: ListeningItem) {
  const text = `${item.sentence} ${item.gistQuestion}`.toLowerCase();

  if (text.includes("deadline") || text.includes("upload") || text.includes("moodle") || text.includes("submit")) {
    return "Assignment instructions and deadline details";
  }

  if (text.includes("vocabulary") || text.includes("glossary")) {
    return "Academic vocabulary support strategies";
  }

  if (text.includes("seminar") || text.includes("example") || text.includes("opinion")) {
    return "Finding evidence in seminar communication";
  }

  return "Main-idea listening in short academic sentences";
}

function buildRecommendation(accuracy: number, averagePlays: number, topWeakPoints: string[]) {
  if (accuracy >= 85 && averagePlays <= 1.5) {
    return "Strong control. Next session, start at 1x speed and focus on faster note capture.";
  }

  if (accuracy < 60) {
    return "Use 0.85x for your first play, then 1x once. Confirm key instruction words before checking.";
  }

  if (averagePlays > 2.3) {
    return "Try a two-step pace: first play at 0.85x, second play at 1x, then answer without replaying.";
  }

  if (topWeakPoints.length > 0) {
    return `Review this area first next time: ${topWeakPoints[0]}.`;
  }

  return "Keep the same rhythm and aim for higher accuracy with fewer replays next session.";
}

export function ListeningWorkbench() {
  const totalItems = listeningWeekOneItems.length;

  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showPostReview, setShowPostReview] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [submittedChoice, setSubmittedChoice] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showListenTooltip, setShowListenTooltip] = useState(false);
  const [showSessionReportModal, setShowSessionReportModal] = useState(false);
  const [playCounts, setPlayCounts] = useState<number[]>(() => listeningWeekOneItems.map(() => 0));
  const [resultByItem, setResultByItem] = useState<Array<boolean | null>>(() => listeningWeekOneItems.map(() => null));
  const [itemStartedAt, setItemStartedAt] = useState(() => Date.now());

  const speedOptions = [0.6, 0.85, 1, 1.15, 1.3];
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasOpenedSessionReportRef = useRef(false);

  const item = listeningWeekOneItems[index];
  const choiceCorrect = isChoiceCorrect(choice, item.gistAnswer);
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const completedAll = answeredCount === totalItems;

  const answeredIndices = resultByItem
    .map((result, itemIndex) => (result === null ? null : itemIndex))
    .filter((itemIndex): itemIndex is number => itemIndex !== null);

  const averagePlays =
    answeredIndices.length > 0
      ? Number((answeredIndices.reduce((sum, itemIndex) => sum + playCounts[itemIndex], 0) / answeredIndices.length).toFixed(1))
      : 0;

  const weakPointCounts = resultByItem.reduce<Record<string, number>>((acc, result, itemIndex) => {
    if (result !== false) return acc;
    const label = getWeakPointLabel(listeningWeekOneItems[itemIndex]);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const topWeakPoints = Object.entries(weakPointCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label]) => label);

  const recommendation = buildRecommendation(accuracy, averagePlays, topWeakPoints);

  const clearTooltipTimer = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
  };

  const showTooltipBriefly = () => {
    if (hasPlayed) return;
    clearTooltipTimer();
    setShowListenTooltip(true);
    tooltipTimerRef.current = setTimeout(() => {
      setShowListenTooltip(false);
    }, 1800);
  };

  const speakSentence = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const playIndex = index;
    const shouldCountForReport = !submittedChoice;

    window.speechSynthesis.cancel();
    setHasPlayed(true);
    if (shouldCountForReport) {
      setPlayCounts((value) => value.map((count, itemIndex) => (itemIndex === playIndex ? count + 1 : count)));
    }
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(item.sentence);
    utterance.lang = "en-US";
    utterance.rate = speed;

    utterance.onstart = () => {
      setIsPlaying(true);
      setHasPlayed(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setHasPlayed(true);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setShowListenTooltip(false);
  };

  const resetCurrent = () => {
    setChoice(null);
    setSubmittedChoice(false);
    setShowHint(false);
    setShowPostReview(false);
    setHasPlayed(false);
    setIsPlaying(false);
    setShowListenTooltip(false);
    setItemStartedAt(Date.now());
    clearTooltipTimer();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    if (completedAll && !hasOpenedSessionReportRef.current) {
      setShowSessionReportModal(true);
      hasOpenedSessionReportRef.current = true;
    }
  }, [completedAll]);

  useEffect(() => {
    return () => {
      clearTooltipTimer();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const nextItem = () => {
    if (index < totalItems - 1) {
      setIndex((value) => value + 1);
      resetCurrent();
    }
  };

  const renderAudioTools = () => (
    <div className="mt-3 rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-gradient-to-br from-[rgba(255,255,255,0.94)] to-[rgba(237,245,251,0.84)] p-4 shadow-[0_8px_22px_rgba(23,32,51,0.06)]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isPlaying ? "bg-[rgba(42,105,88,0.18)] text-[#1f6b52]" : "bg-[rgba(20,50,75,0.08)] text-[var(--ink-soft)]"
            }`}
          >
            {isPlaying ? "Playing..." : hasPlayed ? "Audio completed" : "Not played yet"}
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-[0.9rem] border border-[rgba(20,50,75,0.12)] bg-white/85 p-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={speakSentence}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0f3f66] to-[#0d5b91] px-5 py-2.5 text-sm font-semibold text-[#f7efe3] shadow-[0_8px_20px_rgba(13,91,145,0.28)] transition hover:translate-y-[-1px]"
          >
            <Play className="size-4" /> Play sentence
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Speed</span>
            {speedOptions.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSpeed(value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  speed === value
                    ? "bg-[#234f79] text-white"
                    : "border border-[rgba(20,50,75,0.16)] bg-[rgba(244,246,249,0.95)] text-[var(--ink-soft)] hover:bg-[rgba(20,50,75,0.08)]"
                }`}
              >
                {value.toFixed(2).replace(".00", "")}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <article className="surface-panel rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="section-label">
            <Ear className="size-3.5" /> DIICSU First-Year Listening
          </p>
        </div>

        <h2 className="font-display mt-4 text-3xl tracking-tight text-[var(--ink)]">Listen - Understand - Check - Review</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Accuracy</p>
            <p className="font-display mt-2 text-3xl">{accuracy}%</p>
          </div>
          <div className="rounded-[1.2rem] border border-[rgba(20,50,75,0.12)] bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Current sentence</p>
            <p className="font-display mt-2 text-3xl">
              {index + 1}/{totalItems}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-[rgba(20,50,75,0.12)] bg-white/74 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Task</p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">Listen to the sentence, then choose the correct answer.</p>
          {renderAudioTools()}

          <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">{item.gistQuestion}</h3>
          <div className="mt-4 grid gap-2">
            {item.gistOptions.map((option, optionIndex) => (
              <button
                type="button"
                key={option}
                onClick={() => setChoice(optionIndex)}
                disabled={submittedChoice}
                className={`rounded-[0.9rem] border px-3 py-2 text-left text-sm transition ${
                  choice === optionIndex
                    ? "border-[var(--navy)] bg-[rgba(20,50,75,0.08)] text-[var(--ink)]"
                    : "border-[rgba(20,50,75,0.12)] bg-white/80 text-[var(--ink-soft)] hover:bg-[rgba(20,50,75,0.06)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div
                onMouseEnter={() => {
                  if (!hasPlayed) setShowListenTooltip(true);
                }}
                onMouseLeave={() => setShowListenTooltip(false)}
                onClick={() => {
                  if (!hasPlayed) showTooltipBriefly();
                }}
                className="inline-flex"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!hasPlayed || submittedChoice) return;
                    const durationSec = Math.max(30, Math.round((Date.now() - itemStartedAt) / 1000));
                    recordSkillAttemptInStorage("listening", {
                      correct: choiceCorrect,
                      durationSec,
                      markCompleted: true,
                    });

                    setSubmittedChoice(true);
                    setAnsweredCount((value) => value + 1);
                    if (choiceCorrect) {
                      setCorrectCount((value) => value + 1);
                    }
                    setResultByItem((value) => value.map((result, itemIndex) => (itemIndex === index ? choiceCorrect : result)));
                    setShowPostReview(!choiceCorrect);
                  }}
                  disabled={choice === null || submittedChoice || !hasPlayed}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-[#f7efe3] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-100 disabled:hover:translate-y-0 disabled:bg-[#111827] disabled:text-[#e5e7eb]"
                >
                  Check answer
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowHint((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[rgba(20,50,75,0.08)]"
              >
                <Lightbulb className="size-4" />
                {showHint ? "Hide hint" : "Show hint"}
              </button>
            </div>

            <button
              type="button"
              onClick={nextItem}
              disabled={index >= totalItems - 1 || !submittedChoice}
              className="rounded-full bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-[#f6f0e5] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next sentence
            </button>

            {!hasPlayed && showListenTooltip ? (
              <div className="absolute -top-12 left-0 inline-flex items-center gap-2 rounded-lg border border-[#7a271a] bg-[#b42318] px-3 py-2 text-xs font-semibold text-[#fff4f2] shadow-[0_10px_24px_rgba(180,35,24,0.35)]">
                <CircleAlert className="size-4" />
                Please listen to the sentence first before checking your answer.
              </div>
            ) : null}
          </div>

          {showHint ? (
            <p className="mt-2 rounded-[0.8rem] border border-[rgba(20,50,75,0.1)] bg-white/85 px-3 py-2 text-sm leading-7 text-[var(--ink-soft)]">{item.hint}</p>
          ) : null}

          {submittedChoice ? (
            <div className="mt-4 space-y-3">
              <p
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  choiceCorrect ? "bg-[#e7f6ef] text-[#1f6b52]" : "bg-[#fdeaea] text-[#8d2f2f]"
                }`}
              >
                {choiceCorrect ? <CheckCircle2 className="size-4" /> : <CircleAlert className="size-4" />}
                {choiceCorrect ? "Correct. You can review details or move next." : "Not right. Review the transcript and details below."}
              </p>

              {choiceCorrect ? (
                <button
                  type="button"
                  onClick={() => setShowPostReview((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(20,50,75,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--ink-soft)]"
                >
                  {showPostReview ? "Hide review" : "Show review"}
                </button>
              ) : null}

              {showPostReview ? (
                <div className="rounded-[1rem] border border-[rgba(20,50,75,0.14)] bg-white/85 p-4 text-sm leading-7 text-[var(--ink)]">
                  <p>
                    <span className="font-semibold">Transcript:</span> {item.sentence}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold">Correct answer:</span> {item.gistOptions[item.gistAnswer]}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold">Sentence explanation:</span> {item.gistExplanation}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      {showSessionReportModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.45)] px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[1.4rem] border border-[rgba(20,50,75,0.14)] bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-label">Session report</p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">Your listening session summary</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSessionReportModal(false)}
                className="rounded-full border border-[rgba(20,50,75,0.16)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] hover:bg-[rgba(20,50,75,0.06)]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.82)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Accuracy</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{accuracy}%</p>
              </div>
              <div className="rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.82)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Items completed</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  {answeredCount}/{totalItems}
                </p>
              </div>
              <div className="rounded-[1rem] border border-[rgba(20,50,75,0.12)] bg-[rgba(255,255,255,0.82)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Avg. plays per item</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{averagePlays}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[1rem] border border-[rgba(20,50,75,0.1)] bg-[rgba(244,247,250,0.75)] p-4 text-sm text-[var(--ink)]">
              <p className="font-semibold">Common weak points</p>
              <p className="mt-2">{topWeakPoints.length > 0 ? topWeakPoints.join(" | ") : "No recurring weak point detected in this session."}</p>
            </div>

            <div className="mt-3 rounded-[1rem] border border-[rgba(42,105,88,0.26)] bg-[rgba(231,246,239,0.9)] p-4 text-sm text-[#1f6b52]">
              <p className="font-semibold">Suggested next step</p>
              <p className="mt-2">{recommendation}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

