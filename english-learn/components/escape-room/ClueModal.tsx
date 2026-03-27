import { BookMarked, CheckCircle2 } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";
import type { ClueModalContent } from "@/components/escape-room/types";

export function ClueModal({
  clueContent,
  collected,
  onCollect,
  onClose,
}: {
  clueContent: ClueModalContent | null;
  collected: boolean;
  onCollect: () => void;
  onClose: () => void;
}) {
  if (!clueContent) {
    return null;
  }

  return (
    <ModalShell title={clueContent.title} subtitle={clueContent.subtitle} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.6rem] border border-cyan-300/18 bg-[linear-gradient(145deg,rgba(7,19,33,0.94),rgba(12,38,59,0.86))] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/74">Board text</p>
          <p className="font-display mt-3 text-3xl tracking-tight text-white">{clueContent.headline}</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">{clueContent.body}</p>

          <div className="mt-4 space-y-2 rounded-[1.25rem] border border-white/10 bg-black/18 p-4 text-sm text-slate-200">
            {clueContent.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/56 p-4">
          <div className="flex items-center gap-2">
            <BookMarked className="size-4 text-cyan-200" />
            <p className="text-sm font-semibold tracking-tight text-white">Code fragment</p>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-[0.16em] text-cyan-100">{clueContent.clue.value}</p>
          <p className="mt-1 text-sm text-slate-300">{clueContent.clue.description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onCollect}
            disabled={collected}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_34px_rgba(255,255,255,0.12)] transition hover:translate-y-[-1px] disabled:cursor-default disabled:bg-emerald-600 disabled:text-white"
          >
            {collected ? <CheckCircle2 className="size-4" /> : null}
            {collected ? "Clue collected" : "Collect clue"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
