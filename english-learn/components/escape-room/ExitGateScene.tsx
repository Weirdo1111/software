import { DoorClosed, ShieldCheck, ShieldQuestion } from "lucide-react";

import type { InventoryItem } from "@/components/escape-room/types";
import { cn } from "@/lib/utils";

export function ExitGateScene({
  ready,
  escaped,
  clueValues,
  intelValues,
  items,
  notes,
  missingSteps,
  fullscreen = false,
  onOpenKeypad,
  backgroundImage = "/quests/escape-room/exit-gate.svg",
  sceneLabel = "Scene 03",
  title = "Emergency Exit Console",
  blockedDescription = "The console is still waiting for missing investigation steps.",
  readyDescription = "Board, cart, stacks, drawer, PA, and map checks are complete. The keypad is armed.",
  escapedDescription = "Exit unlocked.",
}: {
  ready: boolean;
  escaped: boolean;
  clueValues: string[];
  intelValues: string[];
  items: InventoryItem[];
  notes: string[];
  missingSteps: string[];
  fullscreen?: boolean;
  onOpenKeypad: () => void;
  backgroundImage?: string;
  sceneLabel?: string;
  title?: string;
  blockedDescription?: string;
  readyDescription?: string;
  escapedDescription?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(155deg,rgba(255,251,244,0.98),rgba(246,239,226,0.96))]",
        fullscreen ? "h-screen" : "h-full min-h-[calc(100vh-15rem)]",
      )}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${backgroundImage}')` }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,20,0.18),rgba(4,10,20,0.46))]" />

      <div className="relative flex h-full min-h-full flex-col justify-between p-4 sm:p-5">
        <div className="max-w-lg rounded-[1.5rem] border border-white/16 bg-[rgba(7,18,30,0.48)] p-4 text-white backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">{sceneLabel}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/84">
            {escaped ? escapedDescription : ready ? readyDescription : blockedDescription}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="rounded-[1.6rem] border border-white/18 bg-[rgba(247,251,255,0.86)] p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-slate-900">
              <DoorClosed className="size-4 text-teal-700" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Access kit</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {clueValues.length ? (
                clueValues.map((value) => (
                  <span key={value} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold tracking-[0.18em] text-teal-900">
                    {value}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-[#d7d2c7] px-3 py-1 text-sm text-slate-500">No number fragments</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {intelValues.length ? (
                intelValues.map((value) => (
                  <span key={value} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold tracking-[0.08em] text-amber-900">
                    {value}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-[#d7d2c7] px-3 py-1 text-sm text-slate-500">Format not verified</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {items.length ? (
                items.map((item) => (
                  <span key={item.id} className="rounded-full border border-[#e1dac8] bg-white px-3 py-1 text-sm font-semibold tracking-[0.08em] text-slate-700">
                    {item.label}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-[#d7d2c7] px-3 py-1 text-sm text-slate-500">No items logged</span>
              )}
            </div>

            {notes.length ? (
              <p className="mt-3 text-xs leading-5 text-slate-600">{notes.at(-1)}</p>
            ) : null}

            {!ready && !escaped ? (
              <div className="mt-3 rounded-[1.1rem] border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
                Missing: {missingSteps.join(", ")}
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.6rem] border border-white/18 bg-[rgba(247,251,255,0.86)] p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-slate-900">
              {ready || escaped ? <ShieldCheck className="size-4 text-emerald-600" /> : <ShieldQuestion className="size-4 text-amber-600" />}
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Console</p>
            </div>

            <button
              type="button"
              onClick={onOpenKeypad}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-900 font-semibold text-white transition hover:translate-y-[-1px]",
                fullscreen ? "px-5 py-3.5 text-sm" : "px-4 py-3 text-sm",
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
