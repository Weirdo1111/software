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
  backgroundImage = "/quests/escape-room/scenes/library-main.png",
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
          : "relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(150deg,rgba(255,252,245,0.98),rgba(247,241,229,0.96))]"
      }
    >
      <div className={fullscreen ? "relative h-screen overflow-hidden" : "relative h-full min-h-[calc(100vh-15rem)] overflow-hidden"}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${backgroundImage}')` }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,20,0.08),rgba(4,10,20,0.34))]" />

        {!fullscreen ? (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
            <div className="max-w-[28rem] rounded-[1.25rem] border border-white/18 bg-[rgba(7,18,30,0.42)] px-3.5 py-3 text-white backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/68">{sceneLabel}</p>
              <h2 className="mt-1 font-display text-xl tracking-tight sm:text-2xl">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-white/82">{description}</p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/24 px-3 py-1.5 text-[11px] font-semibold text-white/88 backdrop-blur-md">
              <Sparkles className="size-3 text-cyan-200" />
              {progress.reward.escaped ? unlockedLabel : disabled ? standbyLabel : `${availableLeadCount} active`}
            </span>
          </div>
        ) : null}

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

        {disabled ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-900/10 backdrop-blur-[1.5px]">
            <div className="rounded-[1.7rem] border border-[#e8dcc7] bg-[rgba(255,250,242,0.86)] px-5 py-4 text-center text-slate-900 shadow-[0_18px_44px_rgba(80,60,20,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700/72">{sceneLabel}</p>
              <p className="mt-2 text-sm font-medium text-slate-800">Press Start.</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
