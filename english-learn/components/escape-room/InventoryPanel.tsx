import { BadgeCheck, BookOpenText, KeyRound, Sparkles } from "lucide-react";

import type { GameProgress } from "@/components/escape-room/types";

export function InventoryPanel({ progress }: { progress: GameProgress }) {
  return (
    <section className="surface-panel rounded-[2rem] p-5 sm:p-6">
      <p className="section-label institution-label">Inventory</p>
      <h3 className="font-display mt-3 text-2xl tracking-tight text-[var(--ink)]">Clues and Rewards</h3>

      <div className="mt-5 rounded-[1.5rem] border border-[rgba(20,50,75,0.1)] bg-white/68 p-4">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-[var(--navy)]" />
          <p className="text-sm font-semibold tracking-tight text-[var(--ink)]">Collected clues</p>
        </div>

        {progress.inventory.clues.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {progress.inventory.clues.map((clue) => (
              <div
                key={clue.id}
                className="rounded-2xl border border-[rgba(28,78,149,0.14)] bg-[linear-gradient(135deg,rgba(233,242,255,0.92),rgba(255,255,255,0.82))] px-3 py-2"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{clue.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-[0.08em] text-[var(--navy)]">{clue.value}</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">{clue.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">No clue fragments yet. Start with the notice board.</p>
        )}
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-[rgba(20,50,75,0.1)] bg-white/68 p-4">
        <div className="flex items-center gap-2">
          <BookOpenText className="size-4 text-[var(--teal)]" />
          <p className="text-sm font-semibold tracking-tight text-[var(--ink)]">Notebook</p>
        </div>

        {progress.inventory.notes.length ? (
          <div className="mt-3 space-y-2">
            {progress.inventory.notes.map((note) => (
              <div key={note} className="rounded-2xl border border-[rgba(42,105,88,0.14)] bg-emerald-50/78 px-3 py-2 text-sm leading-6 text-[var(--ink)]">
                {note}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Hints from the librarian and quiz will appear here.</p>
        )}
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-[rgba(20,50,75,0.1)] bg-white/68 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--amber)]" />
          <p className="text-sm font-semibold tracking-tight text-[var(--ink)]">Reward status</p>
        </div>

        {progress.reward.escaped ? (
          <div className="mt-3 rounded-2xl border border-emerald-300/55 bg-emerald-50/78 px-3 py-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <BadgeCheck className="size-4" />
              <p className="text-sm font-semibold">Quest completed</p>
            </div>
            <p className="mt-2 text-sm text-[var(--ink)]">+{progress.reward.xpEarned} XP</p>
            <p className="mt-1 text-sm text-[var(--ink)]">Badge unlocked: {progress.reward.badgeUnlocked}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">Escape the library to earn +50 XP and the Midnight Reader badge.</p>
        )}
      </div>
    </section>
  );
}
