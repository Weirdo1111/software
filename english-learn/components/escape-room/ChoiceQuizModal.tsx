"use client";

import { useState } from "react";
import { CheckCircle2, GraduationCap } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";
import { choiceQuiz } from "@/components/escape-room/room-data";

export function ChoiceQuizModal({
  completed,
  onSolved,
  onClose,
}: {
  completed: boolean;
  onSolved: () => void;
  onClose: () => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [readyToFinish, setReadyToFinish] = useState(false);
  const effectiveSelectedAnswer = completed ? choiceQuiz.options.find((option) => option.isCorrect)?.id ?? null : selectedAnswer;
  const selectedOption = choiceQuiz.options.find((option) => option.id === effectiveSelectedAnswer);

  const handlePick = (answerId: string) => {
    setSelectedAnswer(answerId);
    const option = choiceQuiz.options.find((entry) => entry.id === answerId);
    setReadyToFinish(Boolean(option?.isCorrect));
  };

  return (
    <ModalShell title="Library Etiquette Quiz" subtitle="One final choice check before the exit keypad unlocks." onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-cyan-200" />
            <p className="text-sm font-semibold tracking-tight text-white">Choice-based progress</p>
          </div>
          <p className="mt-3 text-base font-semibold tracking-tight text-white">{choiceQuiz.question}</p>

          <div className="mt-4 space-y-3">
            {choiceQuiz.options.map((option) => {
                    const active = effectiveSelectedAnswer === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handlePick(option.id)}
                  className={`w-full rounded-[1.25rem] border px-4 py-4 text-left text-sm font-medium transition ${
                    active
                      ? option.isCorrect
                        ? "border-emerald-300/45 bg-emerald-400/12 text-emerald-100"
                        : "border-rose-300/45 bg-rose-400/12 text-rose-100"
                      : "border-white/10 bg-black/18 text-slate-100 hover:border-cyan-300/30 hover:bg-cyan-300/8"
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>

        {selectedOption ? (
          <div
            className={`rounded-[1.5rem] px-4 py-4 text-sm leading-6 ${
              selectedOption.isCorrect ? "border border-emerald-300/35 bg-emerald-400/10 text-emerald-100" : "border border-amber-300/35 bg-amber-300/10 text-amber-100"
            }`}
          >
            {selectedOption.feedback}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onSolved}
            disabled={!(completed || readyToFinish)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <CheckCircle2 className="size-4" />
            {completed ? "Quiz completed" : "Finish quiz"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
