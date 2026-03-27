import { Sparkles } from "lucide-react";

import { Hotspot } from "@/components/escape-room/Hotspot";
import type { GameProgress, RoomObject } from "@/components/escape-room/types";

export function RoomScene({
  roomObjects,
  progress,
  disabled,
  fullscreen = false,
  onHotspotSelect,
}: {
  roomObjects: RoomObject[];
  progress: GameProgress;
  disabled: boolean;
  fullscreen?: boolean;
  onHotspotSelect: (id: RoomObject["id"]) => void;
}) {
  const completionState = {
    "notice-board": progress.completedPuzzles["notice-board"],
    bookshelf: progress.completedPuzzles.bookshelf,
    speaker: progress.completedPuzzles.speaker,
    "librarian-desk-terminal": progress.completedPuzzles["librarian-desk-terminal"],
    "exit-door": progress.reward.escaped,
  } as const;

  return (
    <section className="min-h-[64vh] rounded-[2rem] border border-white/12 bg-[linear-gradient(150deg,rgba(10,18,31,0.98),rgba(13,30,50,0.92))] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.34)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/72">Scene 02</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight text-white sm:text-[2.2rem]">Midnight Library</h2>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-slate-100">
          <Sparkles className="size-4 text-cyan-200" />
          {progress.reward.escaped ? "Exit unlocked" : disabled ? "Hotspots standby" : "Hotspots live"}
        </span>
      </div>

      <div className="relative mt-5 min-h-[56vh] overflow-hidden rounded-[1.85rem] border border-white/12 shadow-[0_24px_64px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/quests/escape-room/library.png')" }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,20,0.12),rgba(4,10,20,0.36))]" />

        {roomObjects.map((roomObject) => (
          <Hotspot
            key={roomObject.id}
            roomObject={roomObject}
            completed={completionState[roomObject.id]}
            disabled={disabled}
            fullscreen={fullscreen}
            onClick={onHotspotSelect}
          />
        ))}

        {!fullscreen ? (
          <div className="absolute inset-x-3 bottom-3 rounded-[1.4rem] border border-white/12 bg-slate-950/48 p-3 text-white backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/72">Current objective</p>
            <p className="mt-1 text-sm font-medium tracking-tight text-white sm:text-base">{progress.currentObjective}</p>
          </div>
        ) : null}

        {disabled ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-900/10 backdrop-blur-[1.5px]">
            <div className="rounded-[1.7rem] border border-white/12 bg-slate-950/62 px-5 py-4 text-center text-white shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/72">Library Briefing</p>
              <p className="mt-2 text-sm font-medium text-white">Press Start.</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
