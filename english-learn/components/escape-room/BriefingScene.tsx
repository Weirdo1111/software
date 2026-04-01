import { cn } from "@/lib/utils";

export function BriefingScene({
  fullscreen = false,
  stageLabel = "Scene 01",
  title = "Midnight Library Escape",
  description = "The library has closed. Follow a real investigation chain: board, cart, stacks, circulation drawer, PA announcement, wall map, then the exit console.",
  previewImage = "/quests/escape-room/scenes/library-briefing.png",
}: {
  started: boolean;
  elapsedLabel: string;
  countdownLabel: string;
  fullscreen?: boolean;
  onStart: () => void;
  stageLabel?: string;
  title?: string;
  description?: string;
  difficulty?: string;
  reward?: string;
  featureChips?: string[];
  rules?: string[];
  previewImage?: string;
  startLabel?: string;
  resumeLabel?: string;
}) {
  return (
    <section className={cn("flex h-full min-h-0 flex-col", !fullscreen && "bg-[linear-gradient(145deg,rgba(255,252,245,0.96),rgba(248,242,230,0.94))]")}>
      <div className={cn("relative flex-1 overflow-hidden", !fullscreen && "min-h-[calc(100vh-14rem)]")}>
        <div className="arcade-cover-sweep pointer-events-none absolute inset-0" />
        <div
          className={cn("h-full bg-cover bg-center", fullscreen ? "min-h-[calc(100vh-8rem)]" : "min-h-full")}
          style={{ backgroundImage: `url('${previewImage}')` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,18,30,0.06),rgba(7,18,30,0.48))]" />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/22 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/84 backdrop-blur-md sm:left-5 sm:top-5">
          {stageLabel}
        </div>
        <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
          <div className="max-w-2xl rounded-[1.5rem] border border-white/25 bg-[rgba(255,255,255,0.14)] p-4 text-white backdrop-blur-md">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/86">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
