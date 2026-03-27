import { BadgeCheck, Sparkles, Trophy } from "lucide-react";

import { ModalShell } from "@/components/escape-room/ModalShell";
import type { RewardState } from "@/components/escape-room/types";

export function RewardModal({
  reward,
  elapsedLabel,
  bestLabel,
  rank,
  onClose,
}: {
  reward: RewardState;
  elapsedLabel: string;
  bestLabel: string;
  rank: string;
  onClose: () => void;
}) {
  return (
    <ModalShell title="Quest Reward" subtitle="The lock clicks open and the library exit finally slides free." onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.6rem] border border-emerald-300/28 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(15,23,42,0.2))] p-5">
          <div className="flex items-center gap-2 text-emerald-300">
            <Trophy className="size-5" />
            <p className="text-base font-semibold tracking-tight">You escaped the library!</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <div className="flex items-center gap-2 text-cyan-200">
                <Sparkles className="size-4" />
                <p className="text-sm font-semibold">XP reward</p>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">+{reward.xpEarned} XP</p>
            </div>

            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <div className="flex items-center gap-2 text-emerald-300">
                <BadgeCheck className="size-4" />
                <p className="text-sm font-semibold">Badge unlocked</p>
              </div>
              <p className="mt-2 text-lg font-semibold tracking-tight text-white">{reward.badgeUnlocked}</p>
            </div>

            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <p className="text-sm font-semibold text-slate-200">Clear time</p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-white">{elapsedLabel}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Best {bestLabel}</p>
            </div>

            <div className="rounded-[1.2rem] border border-white/12 bg-white/6 p-4">
              <p className="text-sm font-semibold text-slate-200">Quest status</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{rank}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Quest completed</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px]"
          >
            Close reward
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
