"use client";

import { useState } from "react";
import { Delete, DoorClosed, RotateCcw } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";

const keypadButtons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "delete"] as const;

export function KeypadModal({
  ready,
  codeLength,
  attempts,
  attemptLimit,
  clueValues,
  missingSteps,
  feedback,
  onSubmit,
  onClose,
}: {
  ready: boolean;
  codeLength: number;
  attempts: number;
  attemptLimit: number;
  clueValues: string[];
  missingSteps: string[];
  feedback: string | null;
  onSubmit: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");

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
    <ModalShell title="Exit Keypad" subtitle="Combine the shelf number and closing time to leave the library." onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
          <div className="flex items-center gap-2 text-cyan-100">
            <DoorClosed className="size-4" />
            <p className="text-sm font-semibold tracking-tight">Exit status</p>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {ready
              ? "The keypad is active. Enter the full 6-digit code."
              : "You still need more clues before unlocking the exit."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {clueValues.length ? (
              clueValues.map((value) => (
                <span key={value} className="rounded-full border border-cyan-300/16 bg-cyan-300/8 px-3 py-2 text-sm font-semibold tracking-[0.16em] text-cyan-100">
                  {value}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-dashed border-white/14 px-3 py-2 text-sm text-slate-300">No code fragments yet</span>
            )}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Wrong attempts trigger a lock reset after {attemptLimit} tries.</p>

          {!ready ? (
            <div className="mt-4 rounded-[1.2rem] bg-amber-300/12 px-4 py-3 text-sm text-amber-100">
              Missing steps: {missingSteps.join(", ")}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-5">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: codeLength }).map((_, index) => (
              <div
                key={`slot-${index}`}
                className="flex h-14 items-center justify-center rounded-[1rem] border border-white/10 bg-black/20 text-lg font-semibold tracking-[0.18em] text-white"
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
                className="inline-flex h-14 items-center justify-center rounded-[1rem] border border-white/10 bg-black/18 text-sm font-semibold text-white transition hover:border-cyan-300/28 hover:bg-cyan-300/8 disabled:cursor-not-allowed disabled:opacity-45"
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
            <p className="text-xs leading-5 text-slate-400">
              Attempts: {attempts} / {attemptLimit}
            </p>
            <button
              type="button"
              disabled={!ready || code.length !== codeLength}
              onClick={() => onSubmit(code)}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Submit code
            </button>
          </div>
        </div>

        {feedback ? (
          <div className={`rounded-[1.4rem] px-4 py-3 text-sm ${ready ? "bg-amber-300/12 text-amber-100" : "bg-rose-400/12 text-rose-100"}`}>
            {feedback}
          </div>
        ) : null}
      </div>
    </ModalShell>
  );
}
