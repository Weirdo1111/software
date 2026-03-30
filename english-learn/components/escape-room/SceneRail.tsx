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
}: {
  activeScene: SceneId;
  unlockedGate: boolean;
  fullscreen?: boolean;
  onSceneChange: (scene: SceneId) => void;
}) {
  const items: Array<{ id: SceneId; label: string; ready: boolean }> = [
    { id: "briefing", label: "Briefing", ready: true },
    { id: "library", label: "Library Floor", ready: true },
    { id: "exit", label: "Exit Door", ready: unlockedGate },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const Icon = sceneIcons[item.id];
        const active = item.id === activeScene;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSceneChange(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border font-semibold transition",
              fullscreen ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm",
              active ? "border-teal-300 bg-teal-50 text-slate-900 shadow-[0_8px_24px_rgba(20,120,110,0.12)]" : "border-[#d9d7cf] bg-white/88 text-slate-700 hover:bg-white",
            )}
          >
            <Icon className={cn(fullscreen ? "size-5" : "size-4")} />
            {item.label}
            {item.ready ? <CheckCircle2 className={cn("text-emerald-600", fullscreen ? "size-5" : "size-4")} /> : null}
          </button>
        );
      })}
    </div>
  );
}
