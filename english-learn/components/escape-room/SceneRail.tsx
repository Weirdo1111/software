import { CheckCircle2, DoorClosed, LibraryBig, ScrollText } from "lucide-react";

import type { SceneId } from "@/components/escape-room/types";
import { cn } from "@/lib/utils";

const sceneIcons = {
  briefing: ScrollText,
  library: LibraryBig,
  exit: DoorClosed,
} as const;

export function SceneRail({
  activeScene,
  unlockedGate,
  fullscreen = false,
  onSceneChange,
  items,
}: {
  activeScene: SceneId;
  unlockedGate: boolean;
  fullscreen?: boolean;
  onSceneChange: (scene: SceneId) => void;
  items?: Array<{ id: SceneId; label: string; ready?: boolean }>;
}) {
  const railItems: Array<{ id: SceneId; label: string; ready: boolean }> = items
    ? items.map((item) => ({ ...item, ready: item.ready ?? true }))
    : [
        { id: "briefing", label: "Entry", ready: true },
        { id: "library", label: "Scene", ready: true },
        { id: "exit", label: "Gate", ready: unlockedGate },
      ];

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {railItems.map((item) => {
        const Icon = sceneIcons[item.id];
        const active = item.id === activeScene;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSceneChange(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border font-semibold transition",
              fullscreen ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[11px]",
              active
                ? "border-blue-200 bg-blue-50 text-slate-900 shadow-[0_8px_24px_rgba(37,99,235,0.12)]"
                : "border-[#d7e6fb] bg-white/88 text-slate-700 hover:bg-white",
              !item.ready && !active ? "opacity-70" : "",
            )}
          >
            <Icon className={cn(fullscreen ? "size-3.5" : "size-3")} />
            {item.label}
            {item.ready ? (
              <CheckCircle2 className={cn("text-emerald-600", fullscreen ? "size-3.5" : "size-3")} />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
