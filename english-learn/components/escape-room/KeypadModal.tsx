"use client";

import { useState } from "react";
import { Delete, DoorClosed, RotateCcw } from "lucide-react";

import { ModalShell, ROOM_RETURN_LABEL } from "@/components/escape-room/ModalShell";
import type { InventoryItem } from "@/components/escape-room/types";

const keypadButtons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "delete"] as const;

export function KeypadModal({
  ready,
  codeLength,
  attempts,
  attemptLimit,
  codeClues,
  intelClues,
  items,
  notes,
  missingSteps,
  feedback,
  title = "Exit Keypad",
  subtitle = "Merge the collected clues into one continuous code.",
  readyDescription,
  blockedDescription,
  onSubmit,
  onClose,
}: {
  ready: boolean;
  codeLength: number;
  attempts: number;
  attemptLimit: number;
  codeClues: string[];
  intelClues: string[];
  items: InventoryItem[];
  notes: string[];
  missingSteps: string[];
  feedback: string | null;
  title?: string;
  subtitle?: string;
  readyDescription?: string;
  blockedDescription?: string;
  onSubmit: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const suspectPatterns =
    codeClues.length >= 2
      ? [`${codeClues[0]}${codeClues[1]}`, `${codeClues[1]}${codeClues[0]}`, `${codeClues[0]}-${codeClues[1]}`]
      : [];

  const appendDigit = (digit: string) => {
    setCode((current) => (current.length >= codeLength ? current : `${current}${digit}`));
  };

  const handlePadClick = (value: (typeof keypadButtons)[number]) => {
    if (value === "clear") {
      setCode("");
      return;
    }

    if (value === "delete") {
      setCode((current) => current.slice(0, -1));
      return;
    }

    appendDigit(value);
  };

  return (
    <ModalShell title={title} subtitle={subtitle} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-white/88 p-5">
          <div className="flex items-center gap-2 text-teal-700">
            <DoorClosed className="size-4" />
            <p className="text-sm font-semibold tracking-tight">Exit status</p>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            {ready
              ? (readyDescription ?? `The console is armed. Enter the full ${codeLength}-digit code as one continuous sequence.`)
              : (blockedDescription ?? "You still need more evidence before this exit console can be trusted.")}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {codeClues.length ? (
              codeClues.map((value) => (
                <span key={value} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold tracking-[0.16em] text-teal-900">
                  {value}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-dashed border-[#d7d2c7] px-3 py-2 text-sm text-slate-500">No code fragments yet</span>
            )}
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Format intel</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {intelClues.length ? (
                intelClues.map((value) => (
                  <span key={value} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold tracking-[0.08em] text-amber-900">
                    {value}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-[#d7d2c7] px-3 py-2 text-sm text-slate-500">Map format not verified yet</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Collected items</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {items.length ? (
                items.map((item) => (
                  <span key={item.id} className="rounded-full border border-[#e1dac8] bg-white px-3 py-2 text-sm font-semibold tracking-[0.08em] text-slate-700">
                    {item.label}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-[#d7d2c7] px-3 py-2 text-sm text-slate-500">No physical evidence logged</span>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Wrong attempts trigger a lock reset after {attemptLimit} tries.</p>

          {!ready ? (
            <div className="mt-4 rounded-[1.2rem] bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Missing steps: {missingSteps.join(", ")}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-[#e8dcc7] bg-white/88 p-5">
          {suspectPatterns.length ? (
            <div className="mb-5 rounded-[1.2rem] border border-[#e1dac8] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Working combinations</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suspectPatterns.map((pattern) => (
                  <span key={pattern} className="rounded-full border border-[#e1dac8] bg-slate-50 px-3 py-1.5 text-sm font-semibold tracking-[0.12em] text-slate-700">
                    {pattern}
                  </span>
                ))}
              </div>
              {notes.length ? (
                <div className="mt-3 space-y-2">
                  {notes.slice(-4).map((note) => (
                    <p key={note} className="text-sm leading-6 text-slate-700">
                      {note}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: codeLength }).map((_, index) => (
              <div
                key={`slot-${index}`}
                className="flex h-14 items-center justify-center rounded-[1rem] border border-[#e1dac8] bg-white text-lg font-semibold tracking-[0.18em] text-slate-900"
              >
                {code[index] ?? ""}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {keypadButtons.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handlePadClick(value)}
                disabled={!ready}
                className="inline-flex h-14 items-center justify-center rounded-[1rem] border border-[#e1dac8] bg-white text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {value === "clear" ? (
                  <span className="inline-flex items-center gap-2 uppercase tracking-[0.18em] text-xs">
                    <RotateCcw className="size-4" />
                    Clear
                  </span>
                ) : value === "delete" ? (
                  <span className="inline-flex items-center gap-2 uppercase tracking-[0.18em] text-xs">
                    <Delete className="size-4" />
                    Delete
                  </span>
                ) : (
                  value
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Attempts: {attempts} / {attemptLimit}
            </p>
            <button
              type="button"
              disabled={!ready || code.length !== codeLength}
              onClick={() => onSubmit(code)}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Submit code
            </button>
          </div>
        </div>

        {feedback ? (
          <div className={`rounded-[1.4rem] px-4 py-3 text-sm ${ready ? "bg-amber-50 text-amber-900" : "bg-rose-50 text-rose-900"}`}>
            {feedback}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#ddd7ca] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {ROOM_RETURN_LABEL}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
