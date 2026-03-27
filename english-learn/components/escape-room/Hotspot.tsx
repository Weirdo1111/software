import clsx from "clsx";
import { BookOpen, CheckCircle2, DoorClosed, Monitor, ScrollText, Volume2 } from "lucide-react";

import type { RoomObject } from "@/components/escape-room/types";

const iconMap = {
  "notice-board": ScrollText,
  bookshelf: BookOpen,
  speaker: Volume2,
  "librarian-desk-terminal": Monitor,
  "exit-door": DoorClosed,
} as const;

export function Hotspot({
  roomObject,
  completed,
  disabled,
  fullscreen = false,
  onClick,
}: {
  roomObject: RoomObject;
  completed: boolean;
  disabled?: boolean;
  fullscreen?: boolean;
  onClick: (id: RoomObject["id"]) => void;
}) {
  const Icon = iconMap[roomObject.id];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(roomObject.id)}
      className={clsx(
        "hotspot-panel group absolute z-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden border text-left backdrop-blur-md transition duration-200",
        fullscreen ? "rounded-[1.4rem] px-4 py-3.5" : "rounded-2xl px-3 py-2",
        completed
          ? "border-emerald-300/50 bg-emerald-400/14 shadow-[0_18px_42px_rgba(16,185,129,0.18)]"
          : "border-cyan-200/28 bg-slate-950/46 shadow-[0_18px_48px_rgba(7,16,29,0.4)] hover:scale-[1.04] hover:border-cyan-200/48 hover:shadow-[0_22px_70px_rgba(44,140,255,0.3)]",
        disabled && "cursor-not-allowed opacity-70 grayscale-[0.25]",
      )}
      style={{ left: roomObject.hotspot.left, top: roomObject.hotspot.top }}
      aria-label={roomObject.name}
    >
      {!completed ? <span className="hotspot-ring pointer-events-none absolute inset-[-10px] rounded-[inherit] border border-cyan-300/28" /> : null}
      <span
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-2xl",
          !completed && "animate-[pulse_2.4s_ease-in-out_infinite] bg-sky-300/14",
        )}
      />
      {!completed ? <span className="hotspot-scan-line pointer-events-none absolute inset-x-2 top-0 h-10 bg-[linear-gradient(180deg,transparent,rgba(125,211,252,0.22),transparent)] blur-sm" /> : null}

      {completed ? (
        <span className="hotspot-badge absolute right-2 top-2 rounded-full border border-emerald-300/35 bg-emerald-400/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
          Clear
        </span>
      ) : null}

      <div className="relative flex items-center gap-3">
        <span className={clsx("relative inline-flex items-center justify-center text-white", roomObject.accent, fullscreen ? "size-12 rounded-2xl" : "size-10 rounded-xl")}>
          <Icon className={clsx(fullscreen ? "size-5" : "size-4")} />
        </span>

        <span className="min-w-0">
          <span className={clsx("block font-semibold tracking-tight text-white", fullscreen ? "text-base" : "text-sm")}>{roomObject.name}</span>
          <span className={clsx("block uppercase tracking-[0.18em] text-slate-300", fullscreen ? "text-xs" : "text-[11px]")}>{roomObject.shortLabel}</span>
        </span>

        {completed ? <CheckCircle2 className={clsx("shrink-0 text-emerald-300", fullscreen ? "size-5" : "size-4")} /> : null}
      </div>
    </button>
  );
}
