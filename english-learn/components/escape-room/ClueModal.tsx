"use client";

import { useState } from "react";
import { BookMarked, CheckCircle2, Search, Sparkles } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";
import type { ClueModalContent, InvestigationTarget, QuizOption } from "@/components/escape-room/types";
import { cn } from "@/lib/utils";

function getTargetCardClasses(clueContent: ClueModalContent, target: InvestigationTarget, active: boolean) {
  if (clueContent.investigation?.visualStyle === "shelf") {
    return cn(
      "min-h-32 rounded-[1.35rem] border px-4 py-4 text-left transition",
      active ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-[#e1dac8] bg-white/90 text-slate-800 hover:border-teal-300 hover:bg-white",
    );
  }

  return cn(
    "min-h-32 rounded-[1.35rem] border px-4 py-4 text-left shadow-[0_18px_34px_rgba(80,60,20,0.08)] transition",
    active ? "border-emerald-300 bg-emerald-50 text-slate-900" : "border-[#f6df96]/50 bg-[#f0d67e] text-slate-900 hover:-translate-y-0.5 hover:border-[#f6df96]/75",
  );
}

function renderOption(option: QuizOption, active: boolean) {
  return cn(
    "rounded-[1.2rem] border px-4 py-3 text-left text-sm font-medium transition",
    active
      ? option.isCorrect
        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
        : "border-rose-300 bg-rose-50 text-rose-900"
      : "border-[#e1dac8] bg-white/90 text-slate-800 hover:border-teal-300 hover:bg-white",
  );
}

export function ClueModal({
  clueContent,
  collected,
  onCollect,
  onClose,
}: {
  clueContent: ClueModalContent | null;
  collected: boolean;
  onCollect: () => void;
  onClose: () => void;
}) {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  if (!clueContent) {
    return null;
  }

  const investigation = clueContent.investigation;
  const selectedTarget = investigation?.targets.find((target) => target.id === selectedTargetId) ?? null;
  const selectedOption = investigation?.options.find((option) => option.id === selectedOptionId) ?? null;

  const targetSolved = collected || !investigation || Boolean(selectedTarget?.isCorrect);
  const questionSolved = collected || !investigation || Boolean(selectedOption?.isCorrect);
  const canCollect = collected || questionSolved;

  return (
    <ModalShell title={clueContent.title} subtitle={clueContent.subtitle} onClose={onClose}>
      <div className="space-y-4">
        {investigation ? (
          <div className="rounded-[1.6rem] border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,245,0.98),rgba(247,241,229,0.96))] p-5">
            <div className="flex items-center gap-2 text-teal-700">
              <Search className="size-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700/80">Close-up scene</p>
            </div>
            <p className="font-display mt-3 text-3xl tracking-tight text-slate-900">{clueContent.headline}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{investigation.prompt}</p>

            <div className={cn("mt-5 grid gap-3", investigation.visualStyle === "shelf" ? "sm:grid-cols-4" : "sm:grid-cols-2")}>
              {investigation.targets.map((target) => {
                const active = selectedTargetId === target.id;

                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => setSelectedTargetId(target.id)}
                    className={getTargetCardClasses(clueContent, target, active)}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{target.label}</p>
                    <p className="mt-3 text-sm leading-6">{target.detail}</p>
                  </button>
                );
              })}
            </div>

            {selectedTarget ? (
              <div
                className={cn(
                  "mt-4 rounded-[1.2rem] px-4 py-3 text-sm leading-6",
                  selectedTarget.isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900",
                )}
              >
                {selectedTarget.isCorrect
                  ? "Correct focus. This is the university clue you should investigate further."
                  : "Readable, but not the lead that controls the library exit. Check the wording more carefully."}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,245,0.98),rgba(247,241,229,0.96))] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700/74">Scene evidence</p>
            <p className="font-display mt-3 text-3xl tracking-tight text-slate-900">{clueContent.headline}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{clueContent.body}</p>

            <div className="mt-4 space-y-2 rounded-[1.25rem] border border-[#e1dac8] bg-white/88 p-4 text-sm text-slate-700">
              {clueContent.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {investigation && targetSolved ? (
          <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-white/88 p-5">
            <div className="flex items-center gap-2 text-teal-700">
              <Sparkles className="size-4" />
              <p className="text-sm font-semibold tracking-tight">English check</p>
            </div>
            <p className="mt-3 text-base font-semibold tracking-tight text-slate-900">{investigation.question}</p>

            <div className="mt-4 grid gap-3">
              {investigation.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOptionId(option.id)}
                  className={renderOption(option, selectedOptionId === option.id)}
                >
                  {option.text}
                </button>
              ))}
            </div>

            {selectedOption ? (
              <div
                className={cn(
                  "mt-4 rounded-[1.2rem] px-4 py-3 text-sm",
                  selectedOption.isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900",
                )}
              >
                {selectedOption.feedback}
              </div>
            ) : null}
          </div>
        ) : null}

        {(questionSolved || !investigation) && (
          <>
            <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-white/88 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700/74">Decoded text</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{clueContent.body}</p>

              <div className="mt-4 space-y-2 rounded-[1.25rem] border border-[#e1dac8] bg-white p-4 text-sm text-slate-700">
                {clueContent.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-[#e8dcc7] bg-white/88 p-4">
              <div className="flex items-center gap-2">
                <BookMarked className="size-4 text-teal-700" />
                <p className="text-sm font-semibold tracking-tight text-slate-900">{clueContent.clue.kind === "code" ? "Code fragment" : "Field intel"}</p>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-[0.16em] text-teal-900">{clueContent.clue.value}</p>
              <p className="mt-1 text-sm text-slate-700">{clueContent.clue.description}</p>
            </div>
          </>
        )}

        {!canCollect ? (
          <div className="rounded-[1.3rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Solve the close-up scene first, then log the clue.
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#ddd7ca] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onCollect}
            disabled={!canCollect || collected}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(15,23,42,0.12)] transition hover:translate-y-[-1px] disabled:cursor-default disabled:bg-emerald-600"
          >
            {collected ? <CheckCircle2 className="size-4" /> : null}
            {collected ? "Evidence logged" : clueContent.clue.kind === "code" ? "Collect clue" : "Log intel"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
