import { Sparkles } from "lucide-react";

import { Hotspot } from "@/components/escape-room/Hotspot";
import { getObjectState } from "@/components/escape-room/puzzle-engine";
import type { GameProgress, RoomObject } from "@/components/escape-room/types";

export function RoomScene({
  roomObjects,
  progress,
  disabled,
  fullscreen = false,
  onHotspotSelect,
  sceneLabel = "Scene 02",
  title = "Midnight Library Floor",
  description = "Read the board, pull the cart lead, search the history stacks, unlock the drawer, confirm the PA, then verify the map.",
  backgroundImage = "/quests/escape-room/library.png",
  standbyLabel = "Hotspots standby",
  unlockedLabel = "Exit unlocked",
}: {
  roomObjects: RoomObject[];
  progress: GameProgress;
  disabled: boolean;
  fullscreen?: boolean;
  onHotspotSelect: (id: RoomObject["id"]) => void;
  sceneLabel?: string;
  title?: string;
  description?: string;
  backgroundImage?: string;
  standbyLabel?: string;
  unlockedLabel?: string;
}) {
  const availableLeadCount = roomObjects.filter((roomObject) => getObjectState(progress, roomObject.id) === "available").length;

  return (
    <section
      className={
        fullscreen
          ? "relative h-screen overflow-hidden bg-[linear-gradient(150deg,rgba(10,18,31,0.98),rgba(13,30,50,0.92))]"
          : "min-h-[64vh] rounded-[2rem] border border-[#e8dcc7] bg-[linear-gradient(150deg,rgba(255,252,245,0.98),rgba(247,241,229,0.96))] p-4 shadow-[0_28px_80px_rgba(80,60,20,0.12)] sm:p-5"
      }
    >
      {!fullscreen ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700/72">{sceneLabel}</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight text-slate-900 sm:text-[2.2rem]">{title}</h2>
            <p className="mt-2 text-sm text-slate-700">{description}</p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd7ca] bg-white/92 px-4 py-2 text-sm font-semibold text-slate-800">
            <Sparkles className="size-4 text-teal-700" />
            {progress.reward.escaped ? unlockedLabel : disabled ? standbyLabel : `${availableLeadCount} active lead${availableLeadCount === 1 ? "" : "s"}`}
          </span>
        </div>
      ) : null}

      <div className={fullscreen ? "relative h-screen overflow-hidden" : "relative mt-5 min-h-[56vh] overflow-hidden rounded-[1.85rem] border border-[#e8dcc7] shadow-[0_24px_64px_rgba(80,60,20,0.12)]"}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${backgroundImage}')` }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,20,0.08),rgba(4,10,20,0.34))]" />

        {roomObjects.map((roomObject) => (
          <Hotspot
            key={roomObject.id}
            roomObject={roomObject}
            state={getObjectState(progress, roomObject.id)}
            disabled={disabled}
            fullscreen={fullscreen}
            onClick={onHotspotSelect}
          />
        ))}

        {!fullscreen ? (
          <div className="absolute inset-x-3 bottom-3 rounded-[1.4rem] border border-[#e8dcc7] bg-[rgba(255,250,242,0.82)] p-3 text-slate-900 backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700/72">Current objective</p>
            <p className="mt-1 text-sm font-medium tracking-tight text-slate-800 sm:text-base">{progress.currentObjective}</p>
          </div>
        ) : null}

        {disabled ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-900/10 backdrop-blur-[1.5px]">
            <div className="rounded-[1.7rem] border border-[#e8dcc7] bg-[rgba(255,250,242,0.86)] px-5 py-4 text-center text-slate-900 shadow-[0_18px_44px_rgba(80,60,20,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700/72">Library Briefing</p>
              <p className="mt-2 text-sm font-medium text-slate-800">Press Start.</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
