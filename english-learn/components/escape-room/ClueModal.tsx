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
      active ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-50" : "border-white/10 bg-[#162338] text-slate-100 hover:border-cyan-300/32 hover:bg-[#1a2d47]",
    );
  }

  return cn(
    "min-h-32 rounded-[1.35rem] border px-4 py-4 text-left shadow-[0_18px_34px_rgba(0,0,0,0.18)] transition",
    active ? "border-emerald-300/40 bg-emerald-400/10 text-slate-950" : "border-[#f6df96]/30 bg-[#f0d67e] text-slate-950 hover:-translate-y-0.5 hover:border-[#f6df96]/55",
  );
}

function renderOption(option: QuizOption, active: boolean) {
  return cn(
    "rounded-[1.2rem] border px-4 py-3 text-left text-sm font-medium transition",
    active
      ? option.isCorrect
        ? "border-emerald-300/45 bg-emerald-400/12 text-emerald-100"
        : "border-rose-300/45 bg-rose-400/12 text-rose-100"
      : "border-white/10 bg-black/18 text-slate-100 hover:border-cyan-300/35 hover:bg-cyan-300/8",
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
          <div className="rounded-[1.6rem] border border-cyan-300/18 bg-[linear-gradient(145deg,rgba(7,19,33,0.94),rgba(12,38,59,0.86))] p-5">
            <div className="flex items-center gap-2 text-cyan-100">
              <Search className="size-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Close-up scene</p>
            </div>
            <p className="font-display mt-3 text-3xl tracking-tight text-white">{clueContent.headline}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{investigation.prompt}</p>

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
                  selectedTarget.isCorrect ? "bg-emerald-400/12 text-emerald-100" : "bg-amber-300/12 text-amber-100",
                )}
              >
                {selectedTarget.isCorrect
                  ? "Correct focus. This is the university clue you should investigate further."
                  : "Readable, but not the lead that controls the library exit. Check the wording more carefully."}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-cyan-300/18 bg-[linear-gradient(145deg,rgba(7,19,33,0.94),rgba(12,38,59,0.86))] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/74">Scene evidence</p>
            <p className="font-display mt-3 text-3xl tracking-tight text-white">{clueContent.headline}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{clueContent.body}</p>

            <div className="mt-4 space-y-2 rounded-[1.25rem] border border-white/10 bg-black/18 p-4 text-sm text-slate-200">
              {clueContent.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {investigation && targetSolved ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
            <div className="flex items-center gap-2 text-cyan-100">
              <Sparkles className="size-4" />
              <p className="text-sm font-semibold tracking-tight">English check</p>
            </div>
            <p className="mt-3 text-base font-semibold tracking-tight text-white">{investigation.question}</p>

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
                  selectedOption.isCorrect ? "bg-emerald-400/12 text-emerald-100" : "bg-amber-300/12 text-amber-100",
                )}
              >
                {selectedOption.feedback}
              </div>
            ) : null}
          </div>
        ) : null}

        {(questionSolved || !investigation) && (
          <>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/74">Decoded text</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{clueContent.body}</p>

              <div className="mt-4 space-y-2 rounded-[1.25rem] border border-white/10 bg-black/18 p-4 text-sm text-slate-200">
                {clueContent.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/56 p-4">
              <div className="flex items-center gap-2">
                <BookMarked className="size-4 text-cyan-200" />
                <p className="text-sm font-semibold tracking-tight text-white">{clueContent.clue.kind === "code" ? "Code fragment" : "Field intel"}</p>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-[0.16em] text-cyan-100">{clueContent.clue.value}</p>
              <p className="mt-1 text-sm text-slate-300">{clueContent.clue.description}</p>
            </div>
          </>
        )}

        {!canCollect ? (
          <div className="rounded-[1.3rem] border border-amber-300/18 bg-amber-300/8 px-4 py-3 text-sm leading-6 text-amber-100">
            Solve the close-up scene first, then log the clue.
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
            onClick={onCollect}
            disabled={!canCollect || collected}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_34px_rgba(255,255,255,0.12)] transition hover:translate-y-[-1px] disabled:cursor-default disabled:bg-emerald-600 disabled:text-white"
          >
            {collected ? <CheckCircle2 className="size-4" /> : null}
            {collected ? "Evidence logged" : clueContent.clue.kind === "code" ? "Collect clue" : "Log intel"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
