"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Headphones, ListChecks, RotateCcw, Volume2 } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";
import { speakerPuzzle } from "@/components/escape-room/room-data";

export function AudioPuzzleModal({
  completed,
  onSolved,
  onClose,
}: {
  completed: boolean;
  onSolved: () => void;
  onClose: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [heardPrompt, setHeardPrompt] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const hasHeardPrompt = completed || heardPrompt;
  const activeStep = speakerPuzzle.steps[stepIndex];
  const effectiveStepIndex = completed ? speakerPuzzle.steps.length - 1 : stepIndex;
  const effectiveStep = speakerPuzzle.steps[effectiveStepIndex];
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

    if (stepIndex === speakerPuzzle.steps.length - 1) {
      onSolved();
      return;
    }

    setStepIndex((current) => current + 1);
  };

  return (
    <ModalShell title="Library Broadcast" subtitle="Replay the closing announcement and confirm the code order." onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
          <div className="flex items-center gap-2 text-cyan-100">
            <Headphones className="size-4" />
            <p className="text-sm font-semibold tracking-tight">Closing announcement</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{speakerPuzzle.instruction}</p>

          <audio ref={audioRef} controls preload="none" className="mt-4 w-full">
            <source src={speakerPuzzle.src} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={playAnnouncement}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
            >
              <Volume2 className="size-4" />
              Play announcement
            </button>

            <button
              type="button"
              onClick={playAnnouncement}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              <RotateCcw className="size-4" />
              Replay
            </button>
          </div>

        </div>

        {hasHeardPrompt ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-cyan-100">
                <ListChecks className="size-4" />
                <p className="text-sm font-semibold tracking-tight">Puzzle step {completed ? speakerPuzzle.steps.length : stepIndex + 1} / {speakerPuzzle.steps.length}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/16 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                Clue {speakerPuzzle.clueValue}
              </span>
            </div>

            <p className="mt-4 text-base font-semibold tracking-tight text-white">{completed ? speakerPuzzle.steps.at(-1)?.question : activeStep.question}</p>
            <div className="mt-4 grid gap-3">
              {(completed ? speakerPuzzle.steps.at(-1)?.options ?? [] : activeStep.options).map((option) => {
                const active = currentSelection === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleAnswerSelect(option.id)}
                    className={`rounded-[1.3rem] border px-4 py-4 text-left text-sm font-medium transition ${
                      active
                        ? option.isCorrect
                          ? "border-emerald-300/45 bg-emerald-400/12 text-emerald-100"
                          : "border-rose-300/45 bg-rose-400/12 text-rose-100"
                        : "border-white/10 bg-black/18 text-slate-100 hover:border-cyan-300/35 hover:bg-cyan-300/8"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>

            {currentOption ? (
              <div
                className={`mt-4 rounded-[1.2rem] px-4 py-3 text-sm ${
                  currentOption.isCorrect ? "bg-emerald-400/12 text-emerald-100" : "bg-amber-300/12 text-amber-100"
                }`}
              >
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
