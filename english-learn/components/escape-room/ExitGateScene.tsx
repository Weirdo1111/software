import { DoorClosed, ShieldCheck, ShieldQuestion } from "lucide-react";

import { cn } from "@/lib/utils";

export function ExitGateScene({
  ready,
  escaped,
  clueValues,
  intelValues,
  notes,
  missingSteps,
  fullscreen = false,
  onOpenKeypad,
}: {
  ready: boolean;
  escaped: boolean;
  clueValues: string[];
  intelValues: string[];
  notes: string[];
  missingSteps: string[];
  fullscreen?: boolean;
  onOpenKeypad: () => void;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(155deg,rgba(9,20,31,0.96),rgba(17,33,53,0.92))]",
        fullscreen ? "h-screen" : "min-h-[64vh] rounded-[2rem] border border-white/12 shadow-[0_28px_80px_rgba(0,0,0,0.35)]",
      )}
    >
      <div className="absolute inset-0 bg-cover bg-center opacity-85" style={{ backgroundImage: "url('/quests/escape-room/exit-gate.svg')" }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,13,25,0.28),rgba(4,10,20,0.72))]" />

      <div className="relative flex min-h-[64vh] flex-col justify-between p-5 sm:p-7">
        <div className="max-w-xl rounded-[1.8rem] border border-white/12 bg-slate-950/42 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/72">Scene 03</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Emergency Exit Console</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {escaped
              ? "Exit unlocked."
              : ready
                ? "All required checks are complete. The keypad is armed."
                : "You still need more clues before unlocking the exit."}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[1.8rem] border border-white/12 bg-slate-950/48 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white">
              <DoorClosed className="size-4 text-cyan-200" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Access evidence</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {clueValues.length ? (
                clueValues.map((value) => (
                  <span key={value} className="rounded-full border border-cyan-300/18 bg-cyan-300/8 px-3 py-1.5 text-sm font-semibold tracking-[0.18em] text-cyan-100">
                    {value}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-white/16 px-3 py-1.5 text-sm text-slate-300">No fragments collected</span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {intelValues.length ? (
                intelValues.map((value) => (
                  <span key={value} className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1.5 text-sm font-semibold tracking-[0.08em] text-amber-100">
                    {value}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-white/16 px-3 py-1.5 text-sm text-slate-300">Optional support intel missing</span>
              )}
            </div>

            {notes.length ? (
              <div className="mt-4 space-y-2">
                {notes.slice(-3).map((note) => (
                  <p key={note} className="text-sm leading-7 text-slate-300">
                    {note}
                  </p>
                ))}
              </div>
            ) : null}

            {!ready && !escaped ? (
              <div className="mt-4 rounded-[1.3rem] border border-amber-300/18 bg-amber-300/8 px-4 py-3 text-sm leading-7 text-amber-100">
                Missing: {missingSteps.join(", ")}
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.8rem] border border-white/12 bg-slate-950/48 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white">
              {ready || escaped ? <ShieldCheck className="size-4 text-emerald-300" /> : <ShieldQuestion className="size-4 text-amber-200" />}
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Console access</p>
            </div>

            <button
              type="button"
              onClick={onOpenKeypad}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center rounded-full bg-white font-semibold text-slate-950 transition hover:translate-y-[-1px]",
                fullscreen ? "px-5 py-4 text-base" : "px-4 py-3 text-sm",
              )}
            >
              {escaped ? "Review keypad" : "Open keypad"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
