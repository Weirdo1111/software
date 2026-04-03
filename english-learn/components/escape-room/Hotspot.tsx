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
  const highlighted = state === "available" && !disabled;
  const showLeadBadge = roomObject.id === "return-cart" || roomObject.id === "floor-map";
  const statusIcon = completed ? CheckCircle2 : locked ? LockKeyhole : showLeadBadge ? ClipboardList : null;
  const StatusIcon = statusIcon;
  const statusText = completed ? "Done" : locked ? "Locked" : showLeadBadge ? "Lead" : roomObject.shortLabel;

  return (
    <button
      type="button"
      disabled={disabled || locked}
      onClick={() => onClick(roomObject.id)}
      title={roomObject.description}
      className={clsx(
        "hotspot-panel group absolute z-20 -translate-x-1/2 -translate-y-1/2 border text-left backdrop-blur-md transition duration-200",
        highlighted ? "overflow-visible" : "overflow-hidden",
        fullscreen ? "rounded-full px-3 py-2" : "rounded-full px-2.5 py-1.5",
        highlighted
          ? "border-cyan-200/80 bg-slate-950/64 shadow-[0_0_0_1px_rgba(125,211,252,0.22),0_0_28px_rgba(34,211,238,0.34),0_22px_72px_rgba(7,16,29,0.46)] hover:scale-[1.06] hover:border-cyan-100 hover:shadow-[0_0_0_1px_rgba(186,230,253,0.28),0_0_38px_rgba(34,211,238,0.44),0_26px_84px_rgba(7,16,29,0.52)]"
          : completed
          ? "border-emerald-300/50 bg-emerald-500/18 shadow-[0_18px_42px_rgba(16,185,129,0.18)]"
          : locked
            ? "border-white/12 bg-slate-950/38 opacity-72 shadow-[0_14px_40px_rgba(7,16,29,0.28)]"
            : "border-cyan-200/28 bg-slate-950/54 shadow-[0_18px_48px_rgba(7,16,29,0.4)] hover:scale-[1.04] hover:border-cyan-200/48 hover:shadow-[0_22px_70px_rgba(44,140,255,0.3)]",
        disabled && "cursor-not-allowed grayscale-[0.25]",
      )}
      style={{ left: roomObject.hotspot.left, top: roomObject.hotspot.top }}
      aria-label={roomObject.name}
    >
      {highlighted ? (
        <>
          <span className="pointer-events-none absolute inset-[-8px] rounded-[inherit] border border-cyan-200/65 shadow-[0_0_18px_rgba(103,232,249,0.45)]" />
          <span className="pointer-events-none absolute inset-[-14px] rounded-[inherit] border border-cyan-200/40 animate-[pulse_1.7s_ease-in-out_infinite]" />
        </>
      ) : null}
      {!completed && !locked ? <span className="hotspot-ring pointer-events-none absolute inset-[-8px] rounded-[inherit] border border-cyan-300/28" /> : null}
      <span
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          !completed && !locked && (highlighted ? "animate-[pulse_1.4s_ease-in-out_infinite] bg-cyan-300/18" : "animate-[pulse_2.4s_ease-in-out_infinite] bg-sky-300/14"),
        )}
      />
      {!completed && !locked ? <span className="hotspot-scan-line pointer-events-none absolute inset-x-2 top-0 h-8 bg-[linear-gradient(180deg,transparent,rgba(125,211,252,0.22),transparent)] blur-sm" /> : null}

      <div className="relative flex items-center gap-2.5">
        <span
          className={clsx(
            "relative inline-flex shrink-0 items-center justify-center rounded-full text-white",
            roomObject.accent,
            highlighted && "ring-2 ring-cyan-100/85 ring-offset-2 ring-offset-slate-950/40",
            fullscreen ? "size-8" : "size-7",
          )}
        >
          <Icon className={clsx(fullscreen ? "size-4" : "size-3.5")} />
        </span>

        <span className="min-w-0">
          <span className={clsx("block truncate font-semibold tracking-tight text-white", fullscreen ? "max-w-[9rem] text-xs" : "max-w-[8rem] text-[11px]")}>
            {roomObject.name}
          </span>
          <span className={clsx("mt-0.5 inline-flex items-center gap-1 uppercase tracking-[0.16em] text-slate-300", fullscreen ? "text-[10px]" : "text-[9px]")}>
            {StatusIcon ? <StatusIcon className={clsx(fullscreen ? "size-3" : "size-2.5")} /> : null}
            {statusText}
          </span>
        </span>
      </div>
    </button>
  );
}
