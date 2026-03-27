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
              active ? "border-cyan-300/40 bg-cyan-300/14 text-white" : "border-white/12 bg-white/6 text-slate-300 hover:bg-white/10",
            )}
          >
            <Icon className={cn(fullscreen ? "size-5" : "size-4")} />
            {item.label}
            {item.ready ? <CheckCircle2 className={cn("text-emerald-300", fullscreen ? "size-5" : "size-4")} /> : null}
          </button>
        );
      })}
    </div>
  );
}
