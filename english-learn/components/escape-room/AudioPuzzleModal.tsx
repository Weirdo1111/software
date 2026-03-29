"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Headphones, ListChecks, RotateCcw, Volume2 } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";
import type { AudioPuzzle } from "@/components/escape-room/types";

export function AudioPuzzleModal({
  puzzle,
  completed,
  onSolved,
  onClose,
  title = "Library Broadcast",
  subtitle = "Replay the closing announcement and confirm the code order.",
}: {
  puzzle: AudioPuzzle;
  completed: boolean;
  onSolved: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [heardPrompt, setHeardPrompt] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const hasHeardPrompt = completed || heardPrompt;
  const activeStep = puzzle.steps[stepIndex];
  const effectiveStepIndex = completed ? puzzle.steps.length - 1 : stepIndex;
  const effectiveStep = puzzle.steps[effectiveStepIndex];
  const currentSelection = completed ? effectiveStep.answerId : selectedAnswers[activeStep.id];
  const currentOption = useMemo(
    () => effectiveStep.options.find((option) => option.id === (completed ? effectiveStep.answerId : selectedAnswers[effectiveStep.id])),
    [completed, effectiveStep, selectedAnswers],
  );

  const playAnnouncement = async () => {
    setHeardPrompt(true);

    try {
      audioRef.current?.pause();
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      await audioRef.current?.play();
    } catch {
      // Browsers may block play until the user interacts with the controls; the built-in player remains available.
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (completed) {
      return;
    }

    setSelectedAnswers((current) => ({
      ...current,
      [activeStep.id]: answerId,
    }));

    if (answerId !== activeStep.answerId) {
      return;
    }

    if (stepIndex === puzzle.steps.length - 1) {
      onSolved();
      return;
    }

    setStepIndex((current) => current + 1);
  };

  return (
    <ModalShell title={title} subtitle={subtitle} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-white/88 p-5">
          <div className="flex items-center gap-2 text-teal-700">
            <Headphones className="size-4" />
            <p className="text-sm font-semibold tracking-tight">Closing announcement</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{puzzle.instruction}</p>

          <audio ref={audioRef} controls preload="none" className="mt-4 w-full">
            <source src={puzzle.src} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={playAnnouncement}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            >
              <Volume2 className="size-4" />
              Play announcement
            </button>

            <button
              type="button"
              onClick={playAnnouncement}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ddd7ca] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="size-4" />
              Replay
            </button>
          </div>
        </div>

        {hasHeardPrompt ? (
          <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-white/88 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-teal-700">
                <ListChecks className="size-4" />
                <p className="text-sm font-semibold tracking-tight">
                  Puzzle step {completed ? puzzle.steps.length : stepIndex + 1} / {puzzle.steps.length}
                </p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-amber-900">
                Clue {puzzle.clueValue}
              </span>
            </div>

            <p className="mt-4 text-base font-semibold tracking-tight text-slate-900">{completed ? puzzle.steps.at(-1)?.question : activeStep.question}</p>
            <div className="mt-4 grid gap-3">
              {(completed ? puzzle.steps.at(-1)?.options ?? [] : activeStep.options).map((option) => {
                const active = currentSelection === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`rounded-[1.3rem] border px-4 py-4 text-left text-sm font-medium transition ${
                      active
                        ? option.isCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-rose-300 bg-rose-50 text-rose-900"
                        : "border-[#e1dac8] bg-white text-slate-800 hover:border-teal-300 hover:bg-slate-50"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>

            {currentOption ? (
              <div className={`mt-4 rounded-[1.2rem] px-4 py-3 text-sm ${currentOption.isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
                <div className="flex items-center gap-2">
                  {currentOption.isCorrect ? <CheckCircle2 className="size-4" /> : <Headphones className="size-4" />}
                  <span>{currentOption.feedback}</span>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ModalShell>
  );
}
