import clsx from "clsx";
import { Archive, Backpack, BookOpen, BriefcaseBusiness, CheckCircle2, ClipboardList, DoorClosed, LockKeyhole, Map, Monitor, NotebookText, ScrollText, SignpostBig, Ticket, Volume2 } from "lucide-react";

import type { RoomObject, RoomObjectState } from "@/components/escape-room/types";

const iconMap = {
  "notice-board": ScrollText,
  "return-cart": Ticket,
  bookshelf: BookOpen,
  "circulation-desk": Monitor,
  speaker: Volume2,
  "floor-map": Map,
  "exit-door": DoorClosed,
  archive: Archive,
  backpack: Backpack,
  notebook: NotebookText,
  ticket: Ticket,
  briefcase: BriefcaseBusiness,
  signpost: SignpostBig,
} as const;

export function Hotspot({
  roomObject,
  state,
  disabled,
  fullscreen = false,
  onClick,
}: {
  roomObject: RoomObject;
  state: RoomObjectState;
  disabled?: boolean;
  fullscreen?: boolean;
  onClick: (id: RoomObject["id"]) => void;
}) {
  const iconKey = (roomObject.iconKey ?? roomObject.id) as keyof typeof iconMap;
  const Icon = iconMap[iconKey];
  const completed = state === "cleared";
  const locked = state === "locked";
  const showLeadBadge = roomObject.id === "return-cart" || roomObject.id === "floor-map";
  const badge = completed ? (
    <span className="hotspot-badge inline-flex items-center gap-1 rounded-full border border-emerald-300/35 bg-emerald-400/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
      <CheckCircle2 className="size-3" />
      Clear
    </span>
  ) : locked ? (
    <span className="hotspot-badge inline-flex items-center gap-1 rounded-full border border-white/16 bg-black/22 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
      <LockKeyhole className="size-3" />
      Locked
    </span>
  ) : showLeadBadge ? (
    <span className="hotspot-badge inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
      <ClipboardList className="size-3" />
      Lead
    </span>
  ) : null;

  return (
    <button
      type="button"
      disabled={disabled || locked}
      onClick={() => onClick(roomObject.id)}
      className={clsx(
        "hotspot-panel group absolute z-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden border text-left backdrop-blur-md transition duration-200",
        fullscreen ? "rounded-[1.4rem] px-4 py-3.5" : "rounded-2xl px-3 py-2",
        completed
          ? "border-emerald-300/50 bg-emerald-400/14 shadow-[0_18px_42px_rgba(16,185,129,0.18)]"
          : locked
            ? "border-white/12 bg-slate-950/34 opacity-72 shadow-[0_14px_40px_rgba(7,16,29,0.28)]"
            : "border-cyan-200/28 bg-slate-950/46 shadow-[0_18px_48px_rgba(7,16,29,0.4)] hover:scale-[1.04] hover:border-cyan-200/48 hover:shadow-[0_22px_70px_rgba(44,140,255,0.3)]",
        disabled && "cursor-not-allowed grayscale-[0.25]",
      )}
      style={{ left: roomObject.hotspot.left, top: roomObject.hotspot.top }}
      aria-label={roomObject.name}
    >
      {!completed && !locked ? <span className="hotspot-ring pointer-events-none absolute inset-[-10px] rounded-[inherit] border border-cyan-300/28" /> : null}
      <span
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-2xl",
          !completed && !locked && "animate-[pulse_2.4s_ease-in-out_infinite] bg-sky-300/14",
        )}
      />
      {!completed && !locked ? <span className="hotspot-scan-line pointer-events-none absolute inset-x-2 top-0 h-10 bg-[linear-gradient(180deg,transparent,rgba(125,211,252,0.22),transparent)] blur-sm" /> : null}

      <div className="relative flex flex-col gap-2">
        {badge ? <div className="flex justify-end">{badge}</div> : null}

        <div className="flex items-center gap-3">
          <span className={clsx("relative inline-flex shrink-0 items-center justify-center text-white", roomObject.accent, fullscreen ? "size-12 rounded-2xl" : "size-10 rounded-xl")}>
            <Icon className={clsx(fullscreen ? "size-5" : "size-4")} />
          </span>

          <span className="min-w-0 flex-1">
            <span className={clsx("block font-semibold tracking-tight text-white", fullscreen ? "text-base" : "text-sm")}>{roomObject.name}</span>
            <span className={clsx("block uppercase tracking-[0.18em] text-slate-300", fullscreen ? "text-xs" : "text-[11px]")}>
              {locked ? "Stand by" : roomObject.shortLabel}
            </span>
          </span>

          {completed ? <CheckCircle2 className={clsx("shrink-0 text-emerald-300", fullscreen ? "size-5" : "size-4")} /> : null}
        </div>
      </div>
    </button>
  );
}
