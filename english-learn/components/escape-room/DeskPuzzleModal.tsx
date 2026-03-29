"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileText, KeyRound, ScanSearch } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";
import type { DeskPuzzle, DeskRecord, InventoryItem, QuizOption } from "@/components/escape-room/types";
import { cn } from "@/lib/utils";

function renderRecord(record: DeskRecord, active: boolean) {
  return cn(
    "rounded-[1.35rem] border px-4 py-4 text-left transition",
    active ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-[#e1dac8] bg-white/90 text-slate-800 hover:border-teal-300 hover:bg-white",
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

export function DeskPuzzleModal({
  puzzle,
  rewardItem,
  completed,
  hasKey,
  onSolved,
  onClose,
  title = "Circulation Drawer",
  subtitle = "Unlock the drawer and identify the after-hours exit card.",
}: {
  puzzle: DeskPuzzle;
  rewardItem: InventoryItem;
  completed: boolean;
  hasKey: boolean;
  onSolved: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const selectedRecord = puzzle.records.find((record) => record.id === selectedRecordId) ?? null;
  const selectedOption = puzzle.options.find((option) => option.id === selectedOptionId) ?? null;
  const recordSolved = completed || Boolean(selectedRecord?.isCorrect);
  const questionSolved = completed || Boolean(selectedOption?.isCorrect);
  const canLog = completed || (hasKey && questionSolved);

  const completionNote = useMemo(() => {
    if (completed) {
      return "Procedure card already logged. The drawer note is in your kit.";
    }

    if (!hasKey) {
      return "The drawer is locked. Recover the brass desk key from the history stacks first.";
    }

    return "Desk key accepted. Find the correct after-hours procedure card.";
  }, [completed, hasKey]);

  return (
    <ModalShell title={title} subtitle={subtitle} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-white/88 p-5">
          <div className="flex items-center gap-2 text-teal-700">
            <KeyRound className="size-4" />
            <p className="text-sm font-semibold tracking-tight">Item check</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{completionNote}</p>

          <div className="mt-4 rounded-[1.2rem] border border-[#e1dac8] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Collected item</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{hasKey || completed ? "Desk Key" : "Key missing"}</p>
            <p className="mt-1 text-sm text-slate-700">Drawer 04 unlocks the circulation procedure cards.</p>
          </div>
        </div>

        {hasKey || completed ? (
          <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,245,0.98),rgba(247,241,229,0.96))] p-5">
            <div className="flex items-center gap-2 text-teal-700">
              <ScanSearch className="size-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700/80">Drawer contents</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-700">{puzzle.prompt}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {puzzle.records.map((record) => (
                <button key={record.id} type="button" onClick={() => setSelectedRecordId(record.id)} className={renderRecord(record, selectedRecordId === record.id)}>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{record.tab}</p>
                  <p className="mt-3 text-sm leading-6">{record.detail}</p>
                </button>
              ))}
            </div>

            {selectedRecord ? (
              <div
                className={cn(
                  "mt-4 rounded-[1.2rem] px-4 py-3 text-sm leading-6",
                  selectedRecord.isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900",
                )}
              >
                {selectedRecord.isCorrect
                  ? "Correct card. This is the only drawer note that controls the emergency exit."
                  : "This drawer card is real, but it does not control the exit console. Check the after-hours language more carefully."}
              </div>
            ) : null}
          </div>
        ) : null}

        {recordSolved && (hasKey || completed) ? (
          <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-white/88 p-5">
            <div className="flex items-center gap-2 text-teal-700">
              <FileText className="size-4" />
              <p className="text-sm font-semibold tracking-tight">Notebook check</p>
            </div>
            <p className="mt-3 text-base font-semibold tracking-tight text-slate-900">{puzzle.question}</p>

            <div className="mt-4 grid gap-3">
              {puzzle.options.map((option) => (
                <button key={option.id} type="button" onClick={() => setSelectedOptionId(option.id)} className={renderOption(option, selectedOptionId === option.id)}>
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

        {(questionSolved || completed) && (
          <div className="rounded-[1.4rem] border border-[#e8dcc7] bg-white/88 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-teal-700" />
              <p className="text-sm font-semibold tracking-tight text-slate-900">Recovered item</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-[0.16em] text-teal-900">{rewardItem.value}</p>
            <p className="mt-1 text-sm text-slate-700">{rewardItem.description}</p>
          </div>
        )}

        {!canLog ? (
          <div className="rounded-[1.3rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Unlock the drawer and solve the procedure check before logging this clue.
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
            onClick={onSolved}
            disabled={!canLog || completed}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(15,23,42,0.12)] transition hover:translate-y-[-1px] disabled:cursor-default disabled:bg-emerald-600"
          >
            {completed ? <CheckCircle2 className="size-4" /> : null}
            {completed ? "Procedure logged" : "Log procedure card"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
